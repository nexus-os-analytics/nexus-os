/**
 * GET /api/campaigns/[id] - Get single campaign
 * PATCH /api/campaigns/[id] - Update campaign
 * DELETE /api/campaigns/[id] - Delete campaign
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/next-auth';
import prisma from '@/lib/prisma';
import { campaignUpdateSchema } from '@/features/campaigns/schemas/campaign.schema';

/**
 * GET /api/campaigns/[id]
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userId = session.user.id;
    const { id: campaignId } = await params;

    const campaign = await prisma.campaign.findUnique({
      where: {
        id: campaignId,
        userId,
      },
      include: {
        product: {
          include: {
            alert: true,
          },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campanha não encontrada' }, { status: 404 });
    }

    return NextResponse.json(campaign);
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return NextResponse.json({ error: 'Erro ao buscar campanha' }, { status: 500 });
  }
}

/**
 * PATCH /api/campaigns/[id]
 * Update campaign (status, selectedVariation, etc.)
 */
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
    const validatedData = campaignUpdateSchema.parse(body);

    // Get existing campaign
    const existingCampaign = await prisma.campaign.findUnique({
      where: {
        id: campaignId,
        userId,
      },
    });

    if (!existingCampaign) {
      return NextResponse.json({ error: 'Campanha não encontrada' }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {};

    if (validatedData.status) {
      updateData.status = validatedData.status;

      // Set timestamps based on status changes
      if (validatedData.status === 'ACTIVE' && !existingCampaign.startedAt) {
        updateData.startedAt = new Date();
      } else if (
        ['COMPLETED', 'PAUSED'].includes(validatedData.status) &&
        existingCampaign.status === 'ACTIVE'
      ) {
        updateData.endedAt = new Date();
      }
    }

    if (validatedData.selectedVariationId) {
      // Validate variation exists
      const variations = existingCampaign.variations as any[];
      const exists = variations.some((v) => v.id === validatedData.selectedVariationId);

      if (!exists) {
        return NextResponse.json({ error: 'Variação selecionada não encontrada' }, { status: 400 });
      }

      updateData.selectedVariationId = validatedData.selectedVariationId;
    }

    if (validatedData.customInstructions !== undefined) {
      updateData.customInstructions = validatedData.customInstructions;
    }

    // Update campaign
    const updatedCampaign = await prisma.campaign.update({
      where: {
        id: campaignId,
      },
      data: updateData,
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
    console.error('Error updating campaign:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Erro ao atualizar campanha' }, { status: 500 });
  }
}

/**
 * DELETE /api/campaigns/[id]
 * Delete campaign
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userId = session.user.id;
    const { id: campaignId } = await params;

    // Check campaign exists and belongs to user
    const campaign = await prisma.campaign.findUnique({
      where: {
        id: campaignId,
        userId,
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campanha não encontrada' }, { status: 404 });
    }

    // Delete campaign
    await prisma.campaign.delete({
      where: {
        id: campaignId,
      },
    });

    return NextResponse.json({ success: true, message: 'Campanha excluída com sucesso' });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return NextResponse.json({ error: 'Erro ao excluir campanha' }, { status: 500 });
  }
}
