// Utility to help download face-api.js models

const MODEL_URLS = {
  tinyFaceDetector: [
    "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights/tiny_face_detector_model-weights_manifest.json",
    "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights/tiny_face_detector_model-shard1",
  ],
  faceLandmark68Net: [
    "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights/face_landmark_68_model-weights_manifest.json",
    "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights/face_landmark_68_model-shard1",
  ],
  faceRecognitionNet: [
    "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights/face_recognition_model-weights_manifest.json",
    "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights/face_recognition_model-shard1",
    "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights/face_recognition_model-shard2",
  ],
};

export async function downloadModels() {
  console.log(
    "Note: To download models locally, visit the URLs above and save them to public/models/"
  );
  console.log("For now, the app will use CDN models automatically.");
}
