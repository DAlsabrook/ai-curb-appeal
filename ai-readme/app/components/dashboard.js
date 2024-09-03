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
    <div className="container-fluid max-w-2xl mx-auto p-5">
      <form className="w-full flex flex-col" onSubmit={handleSubmit}>
        <input
          type="text"
          className="flex-grow mb-2"
          name="prompt"
          placeholder="Enter a prompt to display an image"
        />
        <input
          type="file"
          className="mb-2"
          name="file"
          accept="image/*"
        />
        <button className="button" type="submit">
          Go!
        </button>
      </form>

      {error && <div>{error}</div>}

      <div className="image_container">
        {uploadedImage && (
          <div className="image-wrapper">
            <Image
              src={uploadedImage}
              alt="Uploaded Preview"
              style={{ width: '100%', height: 'auto' }}
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
              style={{ width: '100%', height: 'auto' }}
              height={300}
              width={300}
            />
          </div>
        )}
      </div>
    </div>
  );
}
