import Replicate from "replicate";

// Initialize the Replicate client with the API token
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Function to train the model
async function trainModel() {
    try { // Create the model
      const owner = 'dalsabrook';
      const name = 'earheart_sdxl_2';
      const visibility = 'private';
      const hardware = 'gpu-t4';
      const description = 'AICurbAppeal.com house model'

      const model = await replicate.models.create(
        owner,
        name,
        {
          'visibility': visibility,
          'hardware': hardware,
          'description': description
        }
      );
      console.log(`Model created: ${model.name}`);
      console.log(`Model URL: https://replicate.com/${model.owner}/${model.name}`);


      try { // Training the model that was just created
        const modelOwner = 'stability-ai';
        const modelName = 'sdxl';
        const versionId = '7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc';
        const options = {
          destination: `${owner}/${name}`,
          input: {
            input_images: 'https://res.cloudinary.com/dugyjblat/raw/upload/v1725472027/earhart-house_trft4f.zip',
          },
        };

        const training = await replicate.trainings.create(modelOwner, modelName, versionId, options);

        console.log('Model training started:');
        console.log(`URL: https://replicate.com/p/${training.id}`);
      } catch (error) {
        console.error('Error training model:', error);
      }
    } catch (error) {
      console.error('Error creating model:', error);
    }
}

// Run the training function
trainModel();
