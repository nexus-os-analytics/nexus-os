/**
 * POST /api/campaigns/generate
 *
 * Creates a campaign and generates AI variations
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/next-auth';
import prisma from '@/lib/prisma';
import { campaignGenerationSchema } from '@/features/campaigns/schemas/campaign.schema';
import { generateCampaignVariations } from '@/features/campaigns/services/campaign-ai.service';
import type { CampaignGenerationOutput } from '@/features/campaigns/types';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    // Validate input
    const validatedData = campaignGenerationSchema.parse(body);

    // Get product with alert
    const product = await prisma.blingProduct.findFirst({
      where: {
        blingProductId: validatedData.blingProductId,
        integration: {
          userId,
        },
      },
      include: {
        alert: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }

    if (!product.alert) {
      return NextResponse.json({ error: 'Produto não possui alertas ativos' }, { status: 400 });
    }

    // Validate alert type matches campaign type
    if (validatedData.type === 'LIQUIDATION') {
      if (!['DEAD_STOCK', 'LIQUIDATION'].includes(product.alert.type)) {
        return NextResponse.json(
          { error: 'Produto não é elegível para campanha de liquidação' },
          { status: 400 }
        );
      }
    } else if (validatedData.type === 'OPPORTUNITY') {
      if (product.alert.type !== 'OPPORTUNITY') {
        return NextResponse.json(
          { error: 'Produto não é elegível para campanha de oportunidade' },
          { status: 400 }
        );
      }
    }

    // Generate AI variations
    const variations = await generateCampaignVariations({
      type: validatedData.type,
      product,
      discountPercentage: validatedData.discountPercentage,
      increasePercentage: validatedData.increasePercentage,
      toneOfVoice: validatedData.toneOfVoice,
      customInstructions: validatedData.customInstructions,
    });

    // Create campaign in database
    const campaign = await prisma.campaign.create({
      data: {
        userId,
        type: validatedData.type,
        blingProductId: product.blingProductId,
        discountPercentage: validatedData.discountPercentage,
        increasePercentage: validatedData.increasePercentage,
        toneOfVoice: validatedData.toneOfVoice,
        customInstructions: validatedData.customInstructions,
        variations: variations as any, // Store as JSON
        status: 'DRAFT',
      },
    });

    const response: CampaignGenerationOutput = {
      campaignId: campaign.id,
      variations,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error('Error generating campaign:', error);

    // Handle validation errors
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    // Handle AI generation errors
    if (error.message?.includes('Falha ao gerar campanha')) {
      return NextResponse.json(
        { error: 'Erro ao gerar conteúdo da campanha. Tente novamente.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ error: 'Erro ao criar campanha' }, { status: 500 });
  }
}
