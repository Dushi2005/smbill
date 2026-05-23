
import React from 'react';

interface ImageGalleryProps {
  images: string[];
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
  return (
    <div className="mt-12 w-full max-w-4xl">
       <h3 className="text-2xl font-bold mb-6 text-center font-orbitron">Your Cosmic Creation</h3>
      <div className="grid grid-cols-1 gap-6">
        {images.map((imageSrc, index) => (
          <div key={index} className="bg-black/20 rounded-xl shadow-2xl shadow-blue-500/20 p-2 border border-blue-800/50 overflow-hidden animate-fade-in">
            <img
              src={imageSrc}
              alt={`Generated cosmic art ${index + 1}`}
              className="w-full h-auto object-cover rounded-lg"
            />
          </div>
        ))}
      </div>
        <style>
        {`
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fade-in 0.8s ease-out forwards;
        }
        `}
        </style>
    </div>
  );
};
