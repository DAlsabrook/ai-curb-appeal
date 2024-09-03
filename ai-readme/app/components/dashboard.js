'use client';

import { useState } from "react";
import Image from "next/image";
import '../styles/dashboard.css';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Dashboard() {
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('prompt', e.target.prompt.value);
    const file = e.target.file.files[0];
    formData.append('file', file);

    // Create a preview URL for the uploaded image
    setUploadedImage(URL.createObjectURL(file));

    const response = await fetch("/api/predictions", {
      method: "POST",
      body: formData,
    });

    let prediction = await response.json(); // response from predictions/route.js
    if (response.status !== 201) {
      setError(prediction.detail);
      return;
    }
    setPrediction(prediction);
  };

  return (
    <div className="dashboardContainer">
      <div className="controlPanel threeD">
        <p>Control Panel</p>
        <form onSubmit={handleSubmit} className="fileUploadForm">

          <label htmlFor="model">Model:</label>
          <input type="text" name="model" placeholder="model to use"/>

          <label htmlFor="prompt">Prompt:</label>
          <input type="text" name="prompt" placeholder="enter a prompt to display an image"/>

          <label htmlFor="negPrompt">Negative Prompt: &#40;optional&#41;</label>
          <input type="text" name="negPrompt" placeholder='e.g. "old, broken, dirty, run down"'/>

          <label htmlFor="file">Upload File:</label>
          <input type="file" name="file" accept="image/*"/>

          <button type="submit">Generate</button>
        </form>
      </div>

      {error && <div>{error}</div>}

      <div className="consolePanel">
        <div className="consolePanelNav">
          <ul>
            <li>Models</li>
            <li>Saved images</li>
            <li>Pre-made Styles</li>
          </ul>
        </div>

        <div className="consolePanelContentContainer">
          {uploadedImage && (
            <div className="image-wrapper">
              <Image
                src={uploadedImage}
                alt="Uploaded Preview"
                height={300}
                width={300}
              />
            </div>
          )}
          {prediction && (
            <div className="image-wrapper">
              <Image
                src={prediction[0]}
                alt="Output"
                height={300}
                width={300}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
