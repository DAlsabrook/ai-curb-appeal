'use client';

import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import '../styles/tab-models.css'

export default function TabModels({user}) {
  const [selectedFiles, setSelectedFiles] = useState([]); // This array will contain the list of files to send to backend
  const [error, setError] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]); //Used to preview uploaded images

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

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png']
    }, // Accept only valid image MIME types
    multiple: true,
  });

  // Handle form submition to backend
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
      // const detail = trainingResponse.trainedModel;
      // const trainingUrl = trainingResponse.trainingUrl;
      // console.log(detail, trainingUrl);
      console.log(trainingResponse.detail)
    }
  };

  return (
    <div className="tabModelsContent">
      <form onSubmit={handleSubmit} className='createModelForm'>
        <label htmlFor='name'>Name of Model:</label>
        <input name='name' type='text' placeholder='name for model'></input>

        {/* Error Messege */}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {/* Drag and drop box */}
        <p>Upload Images:</p>
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
  );
}
