import { NextResponse } from 'next/server';
import { getAllGameData } from '@/lib/cosmic';

export async function GET() {
  try {
    const data = await getAllGameData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch game data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch game data' },
      { status: 500 }
    );
  }
}