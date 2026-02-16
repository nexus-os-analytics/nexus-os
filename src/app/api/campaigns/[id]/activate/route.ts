/**
 * PATCH /api/campaigns/[id]/activate
 *
 * Activates a draft campaign with selected variation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/next-auth';
import prisma from '@/lib/prisma';
import { campaignActivationSchema } from '@/features/campaigns/schemas/campaign.schema';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userId = session.user.id;
    const { id: campaignId } = await params;
    const body = await request.json();

    // Validate input
    const validatedData = campaignActivationSchema.parse(body);

    // Get campaign
    const campaign = await prisma.campaign.findUnique({
      where: {
        id: campaignId,
        userId,
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campanha não encontrada' }, { status: 404 });
    }

    if (campaign.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Apenas campanhas em rascunho podem ser ativadas' },
        { status: 400 }
      );
    }

    // Validate that selected variation exists
    const variations = campaign.variations as any[];
    const selectedVariation = variations.find((v) => v.id === validatedData.selectedVariationId);

    if (!selectedVariation) {
      return NextResponse.json({ error: 'Variação selecionada não encontrada' }, { status: 400 });
    }

    // Update campaign status to ACTIVE
    const updatedCampaign = await prisma.campaign.update({
      where: {
        id: campaignId,
      },
      data: {
        status: 'ACTIVE',
        selectedVariationId: validatedData.selectedVariationId,
        startedAt: new Date(),
      },
      include: {
        product: {
          include: {
            alert: true,
          },
        },
      },
    });

    return NextResponse.json(updatedCampaign);
  } catch (error: any) {
    console.error('Error activating campaign:', error);

    // Handle validation errors
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Erro ao ativar campanha' }, { status: 500 });
  }
}
