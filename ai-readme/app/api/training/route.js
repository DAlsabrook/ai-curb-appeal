import Replicate from "replicate";

// Initialize the Replicate client with the API token
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Function to train the model
async function CreateModel(req) {
  if (req.method === "POST") {
    try {
      const modelOwner = 'stability-ai';
      const modelName = 'sdxl';
      const versionId = '7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc';
      const options = {
        destination: 'dalsabrook/white_house',
        input: {
          input_images: 'https://res.cloudinary.com/dugyjblat/raw/upload/v1725302816/white-photos_gsvrij.zip',
        },
      };

      const training = await replicate.trainings.create(modelOwner, modelName, versionId, options);

      console.log('Model training successful:');
      console.log(`URL: https://replicate.com/p/${training.id}`);
    } catch (error) {
      if (error.response && error.response.status === 422) {
        console.error('Invalid version or not permitted:', error.response.data);
      } else {
        console.error('Error during model training:', error);
      }
    }
  } else {
    console.error('Wrong request method.');
  }
}
