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
    console.log('page.js - Promt passed to fetch(): ' + e.target.prompt.value)
    const response = await fetch("/api/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: e.target.prompt.value,
      }),
    });
    console.log('page.js - After handleSubmit');

    let prediction = await response.json(); // response from predictions/route.js
    if (response.status !== 201) {
      setError(prediction.detail);
      return;
    }
    setPrediction(prediction);
    console.log(prediction)

    // THIS logic is to hit the replicate via a "GET request and filter for a specific img already created"
    // // "GET" to the predictions/[id]/route.js
    // const response = await fetch("/api/predictions/" + prediction.id);
    // prediction = await response.json();
    // if (response.status !== 200) {
    //   setError(prediction.detail);
    //   return;
    // }
    // // console.log({ prediction: prediction });
    // setPrediction(prediction);
  };

  return (
    <div className="container max-w-2xl mx-auto p-5">
      <form className="w-full flex" onSubmit={handleSubmit}>
        <input
          type="text"
          className="flex-grow"
          name="prompt"
          placeholder="Enter a prompt to display an image"
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
