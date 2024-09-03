'use client';

import { useState } from "react";

// Tab import
import TabModels from './tab-models.js'
import TabLive from "./tab-live_images.js";

import '../styles/dashboard.css';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Dashboard() {
  // Control panel
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);

  // Consol panel
  const [selectedNavItem, setSelectedNavItem] = useState('Models');

  const renderContent = () => {
    switch (selectedNavItem) {

      case 'Models':
        return (
          <TabModels/>
        );

      case 'Live images':
        return (
          <TabLive
            uploadedImage={uploadedImage}
            prediction={prediction}
          />
        );

      case 'Saved images':
        return (
          <div>Saved Images panel</div>
        );

      case 'Pre-made Styles':
        return (
          <div>Pre-made styles panel</div>
        );
      default:
        return null;
    }
  };


  // Control Panel submit
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
            <li onClick={() => setSelectedNavItem('Models')}>Models</li>
            <li onClick={() => setSelectedNavItem('Live images')}>Live Images</li>
            <li onClick={() => setSelectedNavItem('Saved images')}>Saved Images</li>
            <li onClick={() => setSelectedNavItem('Pre-made Styles')}>Pre-made Styles</li>
          </ul>
        </div>

        <div className="consolePanelContentContainer">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
