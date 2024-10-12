import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useUser } from './UserContext';
import '../styles/tab-generated_images.css'

const TabGeneratedImages = ({ imageUrls }) => {
  return (
    <div className="tabGeneratedContent">
      <div className="images_wrapper">
        {imageUrls && imageUrls.length > 0 ? (
          imageUrls.map((url, index) => (
            <div className="image-wrapper" key={index}>
              <Image src={url} alt={`Generated image ${index}`} width={200} height={200} />
            </div>
          ))
        ) : (
          <p>No images</p>
        )}
      </div>
    </div>
  );
};

export default TabGeneratedImages;
