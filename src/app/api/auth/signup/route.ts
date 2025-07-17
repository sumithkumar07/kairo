import { NextRequest, NextResponse } from 'next/server';
import { signUp } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    const result = await signUp(email, password);
    
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Signup failed' },
      { status: 400 }
    );
  }
}