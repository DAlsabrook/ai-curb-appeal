'use client';
import Image from "next/image";


export default function TabGenerated({ uploadedImage, prediction }) {
  return (
    <div className="tabLiveContent">
      <div>Generated panel</div>
      <div className="image-wrapper">
        {uploadedImage && (
          <Image
            src={uploadedImage}
            alt="Uploaded Preview"
            height={300}
            width={300}
          />
        )}
      </div>
      <div className="image-wrapper">
        {prediction && (
          <Image
            src={prediction[0]}
            alt="Output"
            height={300}
            width={300}
          />
        )}
      </div>
    </div>
  )
}
