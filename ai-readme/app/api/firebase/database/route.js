import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    return new NextResponse(JSON.stringify({ message: 'GET method not allowed' }), { status: 405 });
  } catch (error) {
    return NextResponse.json({ detail: 'Error in Login GET request', error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    return new NextResponse(JSON.stringify({ message: 'POST request' }), { status: 200 });
  } catch (error) {
    return NextResponse.json({ detail: 'Error in Login POST request', error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    return new NextResponse(JSON.stringify({ message: 'PUT method not allowed' }), { status: 405 });
  } catch (error) {
    return NextResponse.json({ detail: 'Error in Login PUT request', error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    return new NextResponse(JSON.stringify({ message: 'DELETE method not allowed' }), { status: 405 });
  } catch (error) {
    return NextResponse.json({ detail: 'Error in Login DELETE request', error: error.message }, { status: 500 });
  }
}
