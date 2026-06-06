import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'Calculator computation is now handled client-side.' },
    { status: 404 },
  );
}
