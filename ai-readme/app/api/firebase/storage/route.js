import { NextResponse } from "next/server";
import { getGeneratedImages, saveImageToStorage } from '@/app/firebase/storage'

export async function GET(req) {
  try {
    return NextResponse.json({ message: 'GET method not allowed' }, { status: 405 });
  } catch (error) {
    return NextResponse.json({ detail: 'Error in storage GET request', error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { uid, action, imageUrls } = await req.json();
    if (action === 'get') {
      // Get all generate images from a specific folder
      const folderPath = `${uid}/generated_images/all_images`;
      const imageURLs = await getGeneratedImages(folderPath);

      return NextResponse.json({ message: 'Success', imageURLs: imageURLs }, { status: 200 });
    } else if (action === 'save') {
      // Save all generated images to a specific folder
      if (!imageUrls || !Array.isArray(imageUrls)) {
        return NextResponse.json({ message: 'Invalid imageUrls' }, { status: 400 });
      }
      const folderPath = `${uid}/generated_images/all_images`;

      const savedImageURLs = await Promise.all(
        imageUrls.map(async (imageUrl) => {
          try {
            const savedUrl = await saveImageToStorage(folderPath, imageUrl);
            return savedUrl;
          } catch (error) {
            console.error(`Error saving image: ${imageUrl}`, error);
            throw error; // Re-throw the error to be caught by Promise.all
          }
        })
      );

      return NextResponse.json({ message: 'Images saved successfully', savedImageURLs: savedImageURLs }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ detail: 'Error in storage POST request', error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    return NextResponse.json({ message: 'PUT method not allowed' }, { status: 405 });
  } catch (error) {
    return NextResponse.json({ detail: 'Error in storage PUT request', error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    return NextResponse.json({ message: 'DELETE method not allowed' }, { status: 405 });
  } catch (error) {
    return NextResponse.json({ detail: 'Error in storage DELETE request', error: error.message }, { status: 500 });
  }
}
