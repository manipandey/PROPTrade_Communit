import { NextResponse } from 'next/server';

export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
  try {
    const res = await fetch('https://nfs.faireconomy.media/ff_calendar_thisweek.json', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; propNPLBot/1.0)',
        'Accept': 'application/json',
      },
      next: { revalidate: 60 } // Next.js fetch cache configuration
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch from ForexFactory: ${res.statusText}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Error fetching calendar:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to fetch calendar data', details: message }, { status: 500 });
  }
}
