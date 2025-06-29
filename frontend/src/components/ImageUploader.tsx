import React from 'react';
import { Camera, Upload, X } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  isUploading?: boolean;
  currentImage?: string;
  onRemoveImage?: () => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelect,
  isUploading = false,
  currentImage,
  onRemoveImage
}) => {
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  };

  if (currentImage) {
    return (
      <div className="relative">
        <img
          src={currentImage}
          alt="Uploaded proof"
          className="w-full h-48 object-cover rounded-2xl shadow-lg"
        />
        {onRemoveImage && (
          <button
            onClick={onRemoveImage}
            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Camera Capture */}
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
          <div className="card-gradient text-center py-8 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
            <Camera className="w-8 h-8 text-primary-500 mx-auto mb-3" />
            <p className="text-sm font-medium text-primary-700">Take Photo</p>
            <p className="text-xs text-primary-500 mt-1">Use camera</p>
          </div>
        </label>

        {/* Gallery Upload */}
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
          <div className="card-gradient text-center py-8 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
            <Upload className="w-8 h-8 text-secondary-500 mx-auto mb-3" />
            <p className="text-sm font-medium text-secondary-700">Upload</p>
            <p className="text-xs text-secondary-500 mt-1">From gallery</p>
          </div>
        </label>
      </div>

      {isUploading && (
        <div className="text-center py-4">
          <div className="inline-flex items-center space-x-2 text-primary-600">
            <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium">Uploading image...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
