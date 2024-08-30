const express = require('express');
const Replicate = require('replicate');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors()); // Enable CORS for all routes
app.use(express.json());

app.post('/api/prompt', async (req, res) => {
  const { prompt } = req.body;
  const replicate = new Replicate({
    auth: 'r8_FEvMq8iNPq00r0BCMYTXAIMBD3wVdEt104KfV', // Replace with your actual token
  });

  try {
    const output = await replicate.run(
      'stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc',
      {
        input: { prompt },
      }
    );
    res.json({ output });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
