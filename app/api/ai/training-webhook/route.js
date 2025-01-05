import { NextResponse } from 'next/server';
import crypto from 'crypto';
import logger from '../../../../lib/logger'; // Adjust the import path as needed
import { db_UpdateUser, db_GetUser } from '../../../firebase/database';

const WEBHOOK_SECRET = process.env.REPLICATE_WEBHOOK_SECRET;

async function verifyWebhook(headers, body) {
  const webhookId = headers.get('webhook-id');
  const webhookTimestamp = headers.get('webhook-timestamp');
  const webhookSignature = headers.get('webhook-signature');

  if (!WEBHOOK_SECRET) {
    logger.error('Webhook secret is not set');
    throw new Error('Webhook secret is not set');
  }

  // Construct the signed content
  const signedContent = `${webhookId}.${webhookTimestamp}.${body}`;

  // Base64 decode the secret
  const secretParts = WEBHOOK_SECRET.split('_');
  if (secretParts.length !== 2) {
    logger.error('Invalid webhook secret format');
    throw new Error('Invalid webhook secret format');
  }
  const secretBytes = Buffer.from(secretParts[1], 'base64');

  // Calculate the expected signature
  const computedSignature = crypto
    .createHmac('sha256', secretBytes)
    .update(signedContent)
    .digest('base64');

  // Extract the expected signatures from the webhook-signature header
  const expectedSignatures = webhookSignature.split(' ').map(sig => sig.split(',')[1]);

  // Verify the signature
  const isValid = expectedSignatures.some(expectedSignature => expectedSignature === computedSignature);

  // Verify the timestamp to prevent replay attacks
  const tolerance = 5 * 60 * 1000; // 5 minutes
  const currentTime = Date.now();
  const webhookTime = parseInt(webhookTimestamp, 10) * 1000;

  if (Math.abs(currentTime - webhookTime) > tolerance) {
    logger.error('Timestamp outside of tolerance');
    throw new Error('Timestamp outside of tolerance');
  }

  return isValid;
}

// Handles POST requests from the webhook
export async function POST(req) {
  try {
    const body = await req.text(); // Get the raw body
    // Verify the webhook
    const isValid = await verifyWebhook(req.headers, body);
    if (!isValid) {
      logger.warn('Invalid webhook signature');
      return NextResponse.json({ message: 'Invalid webhook signature' }, { status: 400 });
    }

    // Extract relevant data from the request body
    const parsedBody = JSON.parse(body);
    const modelId = parsedBody.id;
    const status = parsedBody.status; // possible "starting", "processing", "succeeded", "failed", "canceled"
    const versionId = parsedBody.output.version.split(':')[1];

    // Extract query parameters
    const url = new URL(req.url);
    const searchParams = url.searchParams;
    const userUID = searchParams.get('uid');
    const userGivenName = searchParams.get('modelName');
    const encodedTrainedImg = searchParams.get('trainedImg');
    logger.info(`Encoded ${encodedTrainedImg}`)
    const trainedImg = decodeURIComponent(encodedTrainedImg);
    logger.info(`Training-webhook Route - decoded Image URL: ${trainedImg}`);
    // Check if the model training is completed
    if (status === 'succeeded') {
      // Get the user current state in DB
      const user = await db_GetUser(userUID);
      if (!user) {
        logger.error(`User with UID ${userUID} not found`);
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
      }

      const newCredits = user.credits - 100;
      const inputImages = parsedBody.input.input_images;
      const updates = {
        [`models.${userGivenName}`]: {
          "inputImagesZip": inputImages,
          "version": versionId,
          "modelID": modelId,
          "trainedImg": trainedImg,
        },
        credits: newCredits
      };

      // Update the user in the database
      await db_UpdateUser(userUID, updates);

      // Respond with a success message
      return NextResponse.json({ message: 'Webhook received and processed successfully' }, { status: 200 });
    } else if (status === 'failed' || status === 'canceled') {
      // Remove images from db
      logger.error('Training failed or was cancelled')
    }

    // If the model training is not yet completed
    return NextResponse.json({ message: 'Training is still in progress' }, { status: 200 });
  } catch (error) {
    logger.error(`Error processing webhook: ${error.message}`);
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
