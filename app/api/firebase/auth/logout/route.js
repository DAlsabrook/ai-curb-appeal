import { NextResponse } from "next/server";
import { logoutUser } from '@/app/firebase/auth';

export async function GET(req) {
  try {
    return NextResponse.json({ message: 'GET method not allowed' }, { status: 405 });
  } catch (error) {
    return NextResponse.json({ detail: 'Error in Logout GET request', error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  // Handle user logout function
  try {
    await logoutUser();
    return NextResponse.json({ message: 'User logged out' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ detail: 'Error in Logout POST request', error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    return NextResponse.json({ message: 'PUT method not allowed' }, { status: 405 });
  } catch (error) {
    return NextResponse.json({ detail: 'Error in Logout PUT request', error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    return NextResponse.json({ message: 'DELETE method not allowed' }, { status: 405 });
  } catch (error) {
    return NextResponse.json({ detail: 'Error in Logout DELETE request', error: error.message }, { status: 500 });
  }
}
