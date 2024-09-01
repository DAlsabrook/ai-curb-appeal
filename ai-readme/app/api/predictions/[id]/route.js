import { NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function GET(request, { params }) {
  const { id } = params;
  const prediction = await replicate.predictions.get(id);
  console.log('Getting Image from Replicate via [ID]')

  if (prediction?.error) {
    return NextResponse.json({ detail: prediction.error }, { status: 500 });
  }

  return NextResponse.json(prediction);
}


// THIS logic is to hit the replicate via a "GET request and filter for a specific img already created"
// // "GET" to the predictions/[id]/route.js
// const response = await fetch("/api/predictions/" + prediction.id);
// prediction = await response.json();
// if (response.status !== 200) {
//   setError(prediction.detail);
//   return;
// }
// // console.log({ prediction: prediction });
// setPrediction(prediction);
