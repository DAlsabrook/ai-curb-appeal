import { NextResponse } from "next/server";
import { loginUser } from '@/app/firebase/auth';
import { db_UpdateUser } from '@/app/firebase/database'

export async function GET(req) {
  try {
    return NextResponse.json({ message: 'GET method not allowed' }, { status: 405 });
  } catch (error) {
    return NextResponse.json({ detail: 'Error in Login GET request', error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  // Handle login functionality
  // Returns user object
  try {
    const { email, password } = await req.json();
    const user = await loginUser(email, password);

    return NextResponse.json({ message: 'User logged in', user: user }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ detail: 'Error in Login POST request', error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    return NextResponse.json({ message: 'PUT method not allowed' }, { status: 405 });
  } catch (error) {
    return NextResponse.json({ detail: 'Error in Login PUT request', error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    return NextResponse.json({ message: 'DELETE method not allowed' }, { status: 405 });
  } catch (error) {
    return NextResponse.json({ detail: 'Error in Login DELETE request', error: error.message }, { status: 500 });
  }
}
