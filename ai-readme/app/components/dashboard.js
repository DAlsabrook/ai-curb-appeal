'use client';

import { useState } from "react";
import Image from "next/image";
import style from '../styles/dashboard.css'

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
      <div className="controlPanel">
        <p>Control Panel</p>
        <form onSubmit={handleSubmit} className="fileUploadForm">
          <input type="text" name="model" placeholder="Model to use"/>
          <input type="text" name="prompt" placeholder="Enter a prompt to display an image"/>
          <input type="text" name="negPrompt" placeholder="Negative Prompt"/>
          <input type="file" name="file" accept="image/*"/>
          <button className="button" type="submit">Generate</button>
        </form>
      </div>

      {error && <div>{error}</div>}

      <div className="consolePanel">
        <div className="consolePanelNav">
          <p>Models</p>
          <p>Saved images</p>
          <p>Pre-made Styles</p>
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
