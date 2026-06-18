import { NextResponse } from 'next/server';

export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
  try {
    const res = await fetch('https://nfs.faireconomy.media/ff_calendar_thisweek.json', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PropTradeBot/1.0)',
        'Accept': 'application/json',
      },
      next: { revalidate: 60 } // Next.js fetch cache configuration
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch from ForexFactory: ${res.statusText}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching calendar:', error);
    return NextResponse.json({ error: 'Failed to fetch calendar data', details: error.message }, { status: 500 });
  }
}
