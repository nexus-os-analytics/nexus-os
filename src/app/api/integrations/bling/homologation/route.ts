import { NextResponse } from 'next/server';
import { runBlingHomologation } from '@/features/bling/actions';

export async function POST() {
  try {
    const result = await runBlingHomologation();
    const status = result.success ? 200 : 500;
    return NextResponse.json(result, { status });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error)?.message ?? 'Unknown error' },
      { status: 500 }
    );
  }
}
