'use client';

import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import '../styles/tab-models.css'
import { useUser } from './UserContext'; // Import the useUser hook


export default function TabModels() {
  const [selectedFiles, setSelectedFiles] = useState([]); // This array will contain the list of files to send to backend
  const [error, setError] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]); //Used to preview uploaded images
  const { user, setUser } = useUser(); // Use the useUser hook to get user and setUser

  // training dragndrop logic
  const onDrop = (acceptedFiles) => {
    const newFiles = [...selectedFiles, ...acceptedFiles];
    if (newFiles.length < 5) {
      setError('Please upload 5-10 photos.');
      setSelectedFiles(newFiles);
    } else if (newFiles.length >= 5 && newFiles.length <= 10) {
      setError('');
      setSelectedFiles(newFiles);
    } else if (newFiles.length > 10) {
      setError('Please upload a maximum of 10 photos.');
      return
    }

    const newImageUrls = acceptedFiles.map(file => URL.createObjectURL(file));
    setUploadedImages(prevImages => [...prevImages, ...newImageUrls]);
  };
  // Setup for training file dragndrop
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png']
    }, // Accept only valid image MIME types
    multiple: true,
  });

  // Handle form submition for training a model
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedFiles.length < 5) {
      setError('Please upload at least 5 images to train the model effectively.');
      return
    } else if (selectedFiles.length > 10) {
      setError('You can upload a maximum of 10 images for model training.');
      return
    }

    const formData = new FormData();
    formData.append('name', e.target.name.value);
    selectedFiles.forEach((file, index) => {
      formData.append(`filesList[${index}]`, file);
    });
    formData.append('uid', user.uid);

    const response = await fetch("/api/training", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    let trainingResponse = await response.json(); // response from training/route.js
    if (response.status !== 201) {
      setError(trainingResponse.detail);
      return;
    } else {
      const detail = trainingResponse.trainedModel;
      const trainingUrl = trainingResponse.trainingUrl;
      console.log(detail, trainingUrl);
    }
  };

  // Handle model img selection
  // const modelSelect = (model) => {

  // }

  return (
    <div className="tabModelsContent">
      <div className='OurModels'>
        <h2>Select one of our models!</h2>
        <p>Choose a model, upload an image of your house, and have our models style applied to your house.</p>
        <div className='modelsImages'>
          <img src='/results/test_house1.jpg' alt='testhouseimg' className='testModelImg'></img>
          <img src='/results/test_house2.jpg' alt='testhouseimg' className='testModelImg'></img>
          <img src='/results/test_house3.jpg' alt='testhouseimg' className='testModelImg'></img>
          <img src='/results/test_house4.jpg' alt='testhouseimg' className='testModelImg'></img>
        </div>
      </div>
      <div className='createModelClass'>
        <h2>My Models</h2>
        <form onSubmit={handleSubmit} className='createModelForm'>
          <label htmlFor='name'>Name of Model:</label>
          <input name='name' type='text' placeholder='name for model'></input>
          {/* Error Messege */}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {/* Drag and drop box */}
          <p>Upload 10-20 Images:</p>
          <div {...getRootProps()} className='formDragAndDrop'>
            <input {...getInputProps()} />
            <p>Upload .png, .jpeg, .jpg</p>
            {/* Uploaded image previews */}
            <div>
              {uploadedImages.length > 0 && (
                <div className="image-preview">
                  {uploadedImages.map((image, index) => (
                    <img key={index} src={image} alt={`Preview ${index}`} style={{ width: 'auto', height: '80px', margin: '5px', borderRadius: '10px' }} />
                  ))}
                </div>
              )}
            </div>
          </div>
          <button type='submit'>Start Training</button>
        </form>
      </div>
    </div>
  );
}
