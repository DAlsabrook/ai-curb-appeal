import { NextResponse } from "next/server";
import { registerUser } from '@/app/firebase/auth';
import { db_AddUser, db_UpdateUser, db_GetUser } from './database';

export async function GET(req) {
  try {
    return NextResponse.json({ message: 'GET method not allowed' }, { status: 405 });
  } catch (error) {
    return NextResponse.json({ detail: 'Error in Logout GET request', error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  // Handle user signup function
  try {
    const user = await registerUser();
    const updates = {
        [`models.${userGivenName}`]: {
            "inputImagesZip": inputImages,
            "version": versionId,
            "modelID": modelId
        },
        credits: newCredits
    };

    // Update the user in the database
    await db_UpdateUser(userUID, updates);
    return NextResponse.json({ message: 'User Signed Up!' }, { status: 200 });
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
