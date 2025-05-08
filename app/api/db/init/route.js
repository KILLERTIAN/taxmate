import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';

export async function GET() {
  try {
    await connectToDatabase();
    return NextResponse.json({ success: true, message: 'Database connection initialized' });
  } catch (error) {
    console.error('Failed to initialize database connection:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initialize database connection' },
      { status: 500 }
    );
  }
} 