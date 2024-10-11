import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useUser } from './UserContext';
import '../styles/tab-generated_images.css'

const TabGeneratedImages = ({ prediction }) => {
  const [imageURLs, setImageURLs] = useState([]);
  const [error, setError] = useState(null);
  const { user } = useUser();

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
          setImageURLs(data.imageURLs);
        } else {
          setError(data.error);
        }
      } catch (error) {
        setError('An unexpected error occurred');
      }
    };

    if (user) {
      fetchGeneratedImages();
    }
  }, [user]);

  return (
    <div className="tabGeneratedContent">
      <div>
        <p>From database</p>
        {imageURLs && imageURLs.length > 0 ? (
          imageURLs.map((url, index) => (
            <div className="image-wrapper" key={index}>
              <Image src={url} alt={`Generated image ${index}`} width={200} height={200} />
            </div>
          ))
        ) : (
          <p>No images</p>
        )}
      </div>

      <div>
        <p>From replicate</p>
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
    </div>
  );
};

export default TabGeneratedImages;
