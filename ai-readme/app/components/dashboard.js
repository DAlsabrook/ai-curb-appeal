'use client';

import { useState } from "react";
import { useDropzone } from 'react-dropzone';

// Tab import
import TabModels from './tab-models.js'
import TabGenerated from "./tab-generated_images.js";

import '../styles/dashboard.css';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Dashboard({ setOpenAppDashboard, setOpenAppLanding, setOpenAppPayment, user }) {
  // Control panel
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);

  // Consol panel
  const [selectedNavItem, setSelectedNavItem] = useState('Models');

  const renderContent = () => {
    switch (selectedNavItem) {

      case 'My Models':
        return (
          <TabModels user={user} />
        );

      case 'Generated images':
        return (
          <TabGenerated
            uploadedImage={uploadedImage}
            prediction={prediction}
          />
        );

      case 'Saved images':
        return (
          <div>Saved Images panel</div>
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
    if (file) {
      setUploadedImage(URL.createObjectURL(file));
    }

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

  // Handle file drag and drop in console
  const [selectedFile, setSelectedFile] = useState(null); // This will contain the single file to send to backend
  const [uploadedImagePreview, setUploadedImagePreview] = useState(null); // Used to preview the uploaded image

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 1) {
      setError('You may only upload 1 file.');
      return;
    }

    const file = acceptedFiles[0];
    setSelectedFile(file);
    setUploadedImagePreview(URL.createObjectURL(file));
    setError('');
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png']
    }, // Accept only valid image MIME types
    multiple: false, // Only allow one file
  });

  return (
    <div className="dashboardContainer">
      <div className="controlPanel">
        <div className="controlPanelContent">
          <div>
            <button className="styleSelectButton">Select a Style</button>
          </div>
          <div {...getRootProps()} className='controlFileDragAndDrop'>
            <input {...getInputProps()} />
            {!uploadedImagePreview &&
            // Only display when no image is in preview
              <p>Upload .png, .jpeg, .jpg</p>
            }
            {/* Uploaded image preview */}
            <div>
              {uploadedImagePreview && (
                <div className="prompt-image-preview">
                  <img src={uploadedImagePreview} alt="Preview" />
                </div>
              )}
            </div>
          </div>
          <form onSubmit={handleSubmit} className="promptForm">
            <label htmlFor="prompt">Prompt:</label>
            <input type="text" name="prompt" placeholder="enter a prompt to display an image" />
            <label htmlFor="negPrompt">Negative Prompt: &#40;optional&#41;</label>
            <input type="text" name="negPrompt" placeholder='e.g. "old, broken, dirty, run down"' />
            <button type="submit">Generate</button>
          </form>
        </div>
        {error && <div>{error}</div>}
      </div>

      <div className="consolePanel">
        <div className="consolePanelNav">
          <ul>
            <li onClick={() => setSelectedNavItem('Generated images')}>Generated Images</li>
            <li onClick={() => setSelectedNavItem('Saved images')}>Saved Images</li>
            <li onClick={() => setSelectedNavItem('My Models')}>Model Library</li>
          </ul>
        </div>

        <div className="consolePanelContentContainer">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
