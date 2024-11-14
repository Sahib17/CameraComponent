"use client"

import { useRef, useState, useEffect } from 'react';

interface Stream {
  getTracks: () => MediaStreamTrack[];
}

const GalleryIcon = () => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    className="w-6 h-6"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
  </svg>
);

const CameraComponent = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [galleryImage, setGalleryImage] = useState<string>('');
  const [isImageCaptured, setIsImageCaptured] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [cameraStream, setCameraStream] = useState<Stream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: 'environment'
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraStream(stream);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (cameraStream) {
        const tracks = cameraStream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  const captureImage = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        setImageSrc(canvas.toDataURL('image/png'));
        setIsImageCaptured(true);
        video.pause();
        setIsVideoPlaying(false);
      }
    }
  };

  const handleGalleryUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setGalleryImage(reader.result);
          setIsImageCaptured(true);
          setIsVideoPlaying(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNewImage = () => {
    setImageSrc('');
    setGalleryImage('');
    setIsImageCaptured(false);
    setIsVideoPlaying(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    startCamera();
  };

  return (
    <div className="relative h-screen bg-black">
      <div className="relative h-full">
        <div className="absolute inset-0 overflow-hidden">
          {!imageSrc && !galleryImage && !isImageCaptured && isVideoPlaying && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          )}

          {(imageSrc || galleryImage) && (
            <div className="relative h-full">
              {/* Using regular img tag for data URLs */}
              <div 
                className="relative w-full h-full bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${imageSrc || galleryImage})` }}
              />
            </div>
          )}
        </div>

        <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <label 
              htmlFor="gallery-upload" 
              className="w-14 h-14 rounded-full bg-white/10 backdrop-blur flex items-center justify-center cursor-pointer hover:bg-white/20 transition-all duration-300 active:scale-95"
            >
              <GalleryIcon />
            </label>

            {!isImageCaptured && isVideoPlaying && (
              <button
                onClick={captureImage}
                disabled={!videoRef.current}
                className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center focus:outline-none transform transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Take photo"
              >
                <div className="w-16 h-16 rounded-full bg-white/90 hover:bg-white transition-colors" />
              </button>
            )}

            <div className="w-14 h-14" />
          </div>
        </div>

        {isImageCaptured && (
          <div className="absolute bottom-8 inset-x-0 flex justify-center">
            <button
              onClick={handleNewImage}
              className="px-6 py-3 bg-white text-black rounded-full font-medium hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 active:scale-95"
            >
              Take New Photo
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          id="gallery-upload"
          accept="image/*"
          onChange={handleGalleryUpload}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default CameraComponent;