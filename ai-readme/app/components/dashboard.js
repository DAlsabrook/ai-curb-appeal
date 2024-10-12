'use client';

import { useState, useEffect } from "react";
import { useDropzone } from 'react-dropzone';
import Modal from './modal.js';
import { useUser } from './UserContext'; // Import the useUser hook

// Tab import
import TabModels from './tab-models.js'
import TabGeneratedImages from "./tab-generated_images.js";
import '../styles/dashboard.css';

export default function Dashboard({ setOpenAppDashboard, setOpenAppLanding, setOpenAppPayment }) {
  // Control panel
  // const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null); // This will contain the single file to send to backend
  const [uploadedImagePreview, setUploadedImagePreview] = useState(null); // Used to preview the uploaded image
  const [isControlPanelVisible, setIsControlPanelVisible] = useState(true); // State to control visibility of control panel
  const { user, setUser } = useUser(); // Use the useUser hook to get user and setUser
  const [sliderValue, setSliderValue] = useState(10); // Default value of the slider
  const [imageUrls, setImageUrls] = useState([]); // State to store image URLs

  // Consol panel
  const [selectedNavItem, setSelectedNavItem] = useState('Generated images');

  const handleSliderChange = (event) => {
    setSliderValue(event.target.value);
  };

  // Handle what page is shown on the bottom half of page
  const renderContent = () => {
    switch (selectedNavItem) {
      case 'Generated images':
        return (
          <TabGeneratedImages
            imageUrls={imageUrls}
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

  // Control Panel form prediction submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const file = selectedFile;
    const formData = new FormData();
    formData.append('prompt', e.target.prompt.value);
    formData.append('file', file);
    formData.append('uid', user.uid);
    formData.append('prompt_strength', sliderValue)

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

    // Call a route to save prediction images to DB
    const saveResponse = await fetch("/api/firebase/storage", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid: user.uid,
        action: 'save',
        imageUrls: prediction,
      }),
    });

    const saveResult = await saveResponse.json();
    if (saveResponse.status !== 200) {
      setError(saveResult.detail);
      return;
    }

    // Append saved image URLs to the state
    setImageUrls((prevUrls) => [...saveResult.savedImageURLs, ...prevUrls]);

    console.log('Saved Image URLs:', saveResult.savedImageURLs);
  };

  // Handle file drag and drop for single image used for img2img
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

  // Get all images from database if imageUrls is empty
  useEffect(() => {
    const fetchGeneratedImages = async () => {
      try {
        const response = await fetch('/api/firebase/storage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uid: user.uid,
            action: 'get',
          }),
        });

        const data = await response.json();
        if (response.ok) {
          setImageUrls(data.imageURLs);
        } else {
          setError(data.error);
        }
      } catch (error) {
        setError('An unexpected error occurred getting images from database.');
      }
    };

    if (user && imageUrls.length <= 0) {
      fetchGeneratedImages();
    }
  }, [user]);


  // Toggle control panel visibility
  const toggleControlPanel = () => {
    setIsControlPanelVisible(!isControlPanelVisible);
  };

  return (
    <div className="dashboardContainer">
      <div className="controlPanel" style={{ height: isControlPanelVisible ? 'auto' : 'auto' }}>
        {isControlPanelVisible && (
          <div className="controlPanelContent">
            <div>
              <button className="styleSelectButton"
                onClick={() => setIsModalOpen(true)}>
                Select a Style
              </button>
              <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <TabModels />
              </Modal>
            </div>
            <div {...getRootProps()} className='controlFileDragAndDrop'>
              <input {...getInputProps()} />
              {!uploadedImagePreview &&
                // Only display when no image is in preview
                <div>
                  <p>Image of house to apply styling to</p>
                  <p>Upload .png, .jpeg, .jpg</p>
                </div>
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
              <textarea name="prompt" placeholder="enter a prompt to display an image" />

              <div className="formDiv">
                <div className="formDivLeft">
                  <label htmlFor="negPrompt">Negative Prompt: &#40;optional&#41;</label>
                  <input type="text" name="negPrompt" placeholder='e.g. "old, broken, dirty, run down"' />

                </div>
                <div className="formDivRight">
                  <label htmlFor="slider">Style Strength: <span>{sliderValue}</span> (Higher looks more like style)</label>
                  <input
                    type="range"
                    name="slider"
                    min="0"
                    max="20"
                    step="1"
                    value={sliderValue}
                    onChange={handleSliderChange}
                  />
                </div>
              </div>

              <button type="submit">Generate</button>
            </form>
          </div>
        )}
        {error && <div>{error}</div>}
      </div>

      <div className="consolePanel">
        <div className="consolePanelNav">
          <ul>
            <li onClick={() => setSelectedNavItem('Generated images')}>Generated Images</li>
            <li onClick={() => setSelectedNavItem('Saved images')}>Saved Images</li>
          </ul>
        </div>

        <div className="consolePanelContentContainer">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
