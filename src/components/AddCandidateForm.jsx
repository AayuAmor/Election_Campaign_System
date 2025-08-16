import React, { useState, useRef } from "react";
import Webcam from "react-webcam";
import { useVoting } from "../context/VotingContext";
import { X, Camera, RotateCcw, Upload, Image } from "lucide-react";

function AddCandidateForm({ onClose }) {
  const { addCandidate } = useVoting();
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    party: "",
  });
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [photoMethod, setPhotoMethod] = useState(""); // 'camera' or 'upload'

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim() && (capturedImage || uploadedImage)) {
      addCandidate({
        name: formData.name.trim(),
        party: formData.party.trim() || "Independent",
        image:
          capturedImage || uploadedImage || "https://via.placeholder.com/150",
      });
      resetForm();
      onClose();
    }
  };

  const resetForm = () => {
    setFormData({ name: "", party: "" });
    setCapturedImage(null);
    setUploadedImage(null);
    setShowCamera(false);
    setPhotoMethod("");
  };

  const capturePhoto = () => {
    if (webcamRef.current) {
      setIsCapturing(true);
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
      setUploadedImage(null); // Clear uploaded image if camera is used
      setShowCamera(false);
      setIsCapturing(false);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setShowCamera(true);
  };

  const openCamera = () => {
    setPhotoMethod("camera");
    setShowCamera(true);
    setCapturedImage(null);
    setUploadedImage(null);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target.result);
        setCapturedImage(null); // Clear captured image if upload is used
        setShowCamera(false);
        setPhotoMethod("upload");
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const clearPhoto = () => {
    setCapturedImage(null);
    setUploadedImage(null);
    setPhotoMethod("");
    setShowCamera(false);
  };

  const selectedImage = capturedImage || uploadedImage;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Add New Candidate
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Candidate Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter candidate name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Political Party
          </label>
          <input
            type="text"
            value={formData.party}
            onChange={(e) =>
              setFormData({ ...formData, party: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter party name (optional)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Candidate Photo *
          </label>

          {!photoMethod && !selectedImage && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Image className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-sm text-gray-600 mb-4">
                  Choose how to add candidate photo
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    type="button"
                    onClick={openCamera}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 justify-center"
                  >
                    <Camera className="h-4 w-4" />
                    Take Photo
                  </button>
                  <button
                    type="button"
                    onClick={triggerFileUpload}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2 justify-center"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Photo
                  </button>
                </div>
              </div>
            </div>
          )}

          {showCamera && (
            <div className="space-y-4">
              <div className="webcam-container bg-black rounded-lg overflow-hidden">
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  className="w-full h-64 object-cover"
                  videoConstraints={{
                    width: 640,
                    height: 480,
                    facingMode: "user",
                  }}
                />
              </div>
              <div className="flex gap-2 justify-center">
                <button
                  type="button"
                  onClick={capturePhoto}
                  disabled={isCapturing}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md flex items-center gap-2"
                >
                  {isCapturing ? (
                    <>
                      <div className="loading-spinner w-4 h-4"></div>
                      Capturing...
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4" />
                      Capture Photo
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={clearPhoto}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {selectedImage && !showCamera && (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={selectedImage}
                  alt="Candidate"
                  className="w-full h-64 object-cover rounded-lg border"
                />
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-md text-xs">
                  ✓ Photo {photoMethod === "camera" ? "Captured" : "Uploaded"}
                </div>
              </div>
              <div className="flex gap-2 justify-center">
                {photoMethod === "camera" && (
                  <button
                    type="button"
                    onClick={retakePhoto}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Retake Photo
                  </button>
                )}
                <button
                  type="button"
                  onClick={triggerFileUpload}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {photoMethod === "upload" ? "Change Photo" : "Upload Instead"}
                </button>
                <button
                  type="button"
                  onClick={clearPhoto}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Remove
                </button>
              </div>
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={!selectedImage || !formData.name.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors"
          >
            Add Candidate
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddCandidateForm;
