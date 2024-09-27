'use client';
import Image from "next/image";
import '../styles/tab-generated_images.css';


export default function TabGenerated({ prediction }) {
  return (
    <div className="tabGeneratedContent">
      {prediction && prediction.length > 0 ? (
        prediction.map((imageUrl, index) => (
          <div className="image-wrapper">
            <Image
              key={index}
              src={imageUrl}
              alt={`Output ${index + 1}`}
              height={300}
              width={300}
            />
          </div>
        ))
      ) : (
        <p>No images to display</p>
      )}
    </div>
  )
}
