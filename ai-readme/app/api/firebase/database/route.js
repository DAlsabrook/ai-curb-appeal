import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    return NextResponse.json({ message: 'GET method not allowed' }, { status: 405 });
  } catch (error) {
    return NextResponse.json({ detail: 'Error in database GET request', error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    return NextResponse.json({ message: 'POST request' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ detail: 'Error in database POST request', error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    return NextResponse.json({ message: 'PUT method not allowed' }, { status: 405 });
  } catch (error) {
    return NextResponse.json({ detail: 'Error in database PUT request', error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    return NextResponse.json({ message: 'DELETE method not allowed' }, { status: 405 });
  } catch (error) {
    return NextResponse.json({ detail: 'Error in database DELETE request', error: error.message }, { status: 500 });
  }
}
