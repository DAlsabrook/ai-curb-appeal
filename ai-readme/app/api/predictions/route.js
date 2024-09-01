import { NextResponse } from "next/server";
import formidable from "formidable";
import fs from "fs";
import Replicate from "replicate";

// Initialize the Replicate client with the API token
const replicateClient = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Disable the default body parser to handle file uploads with formidable
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  // Convert NextRequest to a standard Node.js request
  const nodeReq = req.nextUrl ? req : Object.assign(req, { nextUrl: new URL(req.url, `http://${req.headers.host}`) });

  const form = formidable({ multiples: true });

  return new Promise((resolve, reject) => {
    form.parse(nodeReq, async (parseError, fields, files) => {
      if (parseError) {
        console.error('Error parsing form data:', parseError);
        resolve(NextResponse.json({ detail: "Error parsing form data" }, { status: 500 }));
        return;
      }

      const { prompt } = fields;
      const uploadedFile = files.file;

      if (!prompt || !uploadedFile) {
        resolve(NextResponse.json({ detail: "Prompt and file are required" }, { status: 400 }));
        return;
      }

      // Read the uploaded file
      const filePath = uploadedFile.filepath;
      const fileData = fs.readFileSync(filePath);

      try {
        // Send the file and prompt to the external API
        const apiResponse = await replicateClient.run("black-forest-labs/flux-dev", {
          input: { prompt, file: fileData },
        });

        if (apiResponse.error) {
          console.log("Error from API response.");
          resolve(NextResponse.json({ detail: apiResponse.error }, { status: 500 }));
          return;
        }

        // Delete the file after it has been successfully sent to the API
        fs.unlinkSync(filePath);

        resolve(NextResponse.json(apiResponse, { status: 201 }));
      } catch (apiError) {
        console.error('Error during API call:', apiError);
        resolve(NextResponse.json({ detail: "Error during API call" }, { status: 500 }));
      }
    });
  });
}
