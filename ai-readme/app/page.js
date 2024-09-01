'use client';

import { useState } from "react";
import Image from "next/image";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Home() {
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('page.js - Before handleSubmit');

    const formData = new FormData();
    formData.append('prompt', e.target.prompt.value);
    formData.append('file', e.target.file.files[0]);

    console.log('page.js - FormData:', formData);

    const response = await fetch("/api/predictions", {
      method: "POST",
      body: formData,
    });
    console.log('page.js - After handleSubmit');

    let prediction = await response.json(); // response from predictions/route.js
    if (response.status !== 201) {
      setError(prediction.detail);
      return;
    }
    setPrediction(prediction);
    console.log(prediction);
  };

  return (
    <div className="container max-w-2xl mx-auto p-5">
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

      {prediction && (
        <>
          {prediction && (
            <div className="image-wrapper mt-5">
              <Image
                src={prediction[0]}
                alt="output"
                sizes="100vw"
                height={768}
                width={768}
              />
            </div>
          )}
          <p className="py-3 text-sm opacity-50">status: {prediction[0]}</p>
        </>
      )}
    </div>
  );
}
