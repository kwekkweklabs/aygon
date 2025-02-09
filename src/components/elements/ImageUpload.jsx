import React, { useState, useCallback } from 'react';
// import { Card, Button, Progress } from '@nextui-org/react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { Button, Card, Progress } from '@heroui/react';

export default function ImageUpload({ imageUrl, setImageUrl }) {
  const [image, setImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const uploadToCloudinary = async (file) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ml_default'); // Replace with your upload preset

    try {
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, // Replace with your cloud name
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();
      
      clearInterval(interval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setIsLoading(false);
        setUploadProgress(0);
      }, 500);

      console.log('Upload success:', data);
      setImageUrl(data.secure_url);
    } catch (error) {
      console.error('Upload error:', error);
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = useCallback(
    async (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        setImage(URL.createObjectURL(file));
        await uploadToCloudinary(file);
      }
    },
    [setImageUrl]
  );

  const handleFileInput = async (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImage(URL.createObjectURL(file));
      await uploadToCloudinary(file);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card
        className={`relative p-8 border-2 border-dashed transition-all duration-200 ${
          isDragging
            ? 'border-primary bg-primary/10'
            : 'border-gray-300 hover:border-primary'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileInput}
          id="file-input"
        />

        {isLoading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
            <Progress
              size="md"
              value={uploadProgress}
              className="max-w-md mb-4"
              color="primary"
            />
            <p className="text-sm text-gray-600">Uploading... {uploadProgress}%</p>
          </div>
        )}

        <div className="flex flex-col items-center justify-center min-h-[200px]">
          {image || imageUrl ? (
            <div className="relative w-full aspect-video">
              <img
                src={image || imageUrl}
                alt="Preview"
                className="w-full h-full object-cover rounded-lg"
              />
              <label
                htmlFor="file-input"
                className="absolute bottom-4 right-4 cursor-pointer"
              >
                <Button
                  size="sm"
                  color="primary"
                  variant="flat"
                  startContent={<Upload size={16} />}
                >
                  Change Image
                </Button>
              </label>
            </div>
          ) : (
            <label
              htmlFor="file-input"
              className="flex flex-col items-center justify-center cursor-pointer"
            >
              <ImageIcon size={48} className="text-gray-400 mb-4" />
              <p className="text-lg font-medium mb-2">
                Drag and drop your image here
              </p>
              <p className="text-sm text-gray-500 mb-4">
                or click to browse files
              </p>
              <Button
                color="primary"
                variant="flat"
                startContent={<Upload size={16} />}
              >
                Upload Image
              </Button>
            </label>
          )}
        </div>
      </Card>
    </div>
  );
}