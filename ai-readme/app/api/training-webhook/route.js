import { NextResponse } from 'next/server';


// Route would be aicurbappeal.com/api/training-webhook
// Handles POST requests from the webhook
export async function POST(req) {
  try {
    const body = await req.json();

    // Extract relevant data from the request body
    const modelId = body.id;
    const status = body.status; // possible "starting", "processing", "succeeded", "failed", "canceled"
    const versionId = body.version; // I think this is what we need to make predictions

    console.log('Data recieved from Replicate:')
    console.log(body)

    // Check if the model training is completed
    if (status === 'succeeded') {
      // Log the model ID and version ID
      console.log(`Model ID: ${modelId} is trained, Version ID: ${versionId}`);

      // Example: Save the model version ID to a database

      // Respond with a success message
      return NextResponse.json({ message: 'Webhook received and processed successfully' }, { status: 200 });
    }

    // If the model training is not yet completed
    return NextResponse.json({ message: 'Training is still in progress' }, { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// Optionally handle non-POST requests with a 405 Method Not Allowed response
export function GET() {
  return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
}

export function PUT() {
  return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
}


// Recieved data from replicate
// {
//   "id": "ufawqhfynnddngldkgtslldrkq",
//   "version": "5c7d5dc6dd8bf75c1acaa8565735e7986bc5b66206b55cca93cb72c9bf15ccaa",
//   "created_at": "2022-04-26T22:13:06.224088Z",
//   "started_at": null,
//   "completed_at": null,
//   "status": "starting",
//   "input": {
//     "text": "Alice"
//   },
//   "output": null,
//   "error": null,
//   "logs": null,
//   "metrics": { }
// }
