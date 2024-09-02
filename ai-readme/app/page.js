'use client';

import { useState } from "react";
import Image from "next/image";
import Dashboard from './components/dashboard'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Home() {
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
      <Dashboard/>
    </div>
  );
}
