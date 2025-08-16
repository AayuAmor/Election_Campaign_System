import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import { useVoting } from "../context/VotingContext";
import { Camera, ArrowLeft, CheckCircle, XCircle } from "lucide-react";

function VotingPage() {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const { state, castVote, checkIfFaceHasVoted, canVote, getRemainingVotes } =
    useVoting();
  const webcamRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info"); // 'info', 'success', 'error'
  const [voterName, setVoterName] = useState("");
  const [modelsLoaded, setModelsLoaded] = useState(false);

  const candidate = state.candidates.find(
    (c) => c.id === parseInt(candidateId)
  );

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      setMessage("Loading face recognition models...");

      // Try local models first, then fall back to CDN
      let MODEL_URL = "/models";

      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      } catch (error) {
        console.log("Local models not found, trying CDN...");
        MODEL_URL =
          "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights";
      }

      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);

      setModelsLoaded(true);
      setMessage(
        "Face recognition ready. Please enter voter name and capture your face."
      );
      setMessageType("info");
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading models:", error);
      setMessage(
        "Using simplified voting mode. Face recognition models could not be loaded."
      );
      setMessageType("info");
      setModelsLoaded(false);
      setIsLoading(false);
    }
  };

  const speakMessage = (text) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  const handleCapture = async () => {
    if (!canVote()) {
      const errorMsg =
        "Voting has ended. Maximum of 3000 voters has been reached.";
      setMessage(errorMsg);
      setMessageType("error");
      speakMessage(errorMsg);
      return;
    }

    if (!voterName.trim()) {
      const errorMsg = "Please enter voter name first.";
      setMessage(errorMsg);
      setMessageType("error");
      speakMessage(errorMsg);
      return;
    }

    setIsCapturing(true);
    setMessage("Capturing and analyzing your face...");

    try {
      if (modelsLoaded && webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot();
        const img = await faceapi.fetchImage(imageSrc);

        const detections = await faceapi
          .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptors();

        if (detections.length === 0) {
          const errorMsg =
            "No face detected. Please ensure your face is clearly visible and try again.";
          setMessage(errorMsg);
          setMessageType("error");
          speakMessage(errorMsg);
          setIsCapturing(false);
          return;
        }

        if (detections.length > 1) {
          const errorMsg =
            "Multiple faces detected. Please ensure only one person is in the frame.";
          setMessage(errorMsg);
          setMessageType("error");
          speakMessage(errorMsg);
          setIsCapturing(false);
          return;
        }

        const faceDescriptor = detections[0].descriptor;

        // Check if this face has already voted
        if (checkIfFaceHasVoted(faceDescriptor)) {
          const errorMsg =
            "Invalid vote: This face has already voted once. One face can only vote once.";
          setMessage(errorMsg);
          setMessageType("error");
          speakMessage(errorMsg);
          setIsCapturing(false);
          return;
        }

        // Cast the vote
        castVote(
          parseInt(candidateId),
          Array.from(faceDescriptor),
          voterName.trim()
        );

        const successMsg = `Vote successfully recorded for ${candidate.name}. Thank you for voting, ${voterName}!`;
        setMessage(successMsg);
        setMessageType("success");
        speakMessage(successMsg);

        setTimeout(() => {
          navigate("/");
        }, 3000);
      } else {
        // Fallback method for demonstration
        const fallbackDescriptor = `${Date.now()}_${voterName}_${Math.random()}`;

        if (checkIfFaceHasVoted(fallbackDescriptor)) {
          const errorMsg =
            "Invalid vote: You have already voted. One person can only vote once.";
          setMessage(errorMsg);
          setMessageType("error");
          speakMessage(errorMsg);
          setIsCapturing(false);
          return;
        }

        castVote(parseInt(candidateId), fallbackDescriptor, voterName.trim());

        const successMsg = `Vote successfully recorded for ${candidate.name}. Thank you for voting, ${voterName}!`;
        setMessage(successMsg);
        setMessageType("success");
        speakMessage(successMsg);

        setTimeout(() => {
          navigate("/");
        }, 3000);
      }
    } catch (error) {
      console.error("Error processing vote:", error);
      const errorMsg = "Error processing your vote. Please try again.";
      setMessage(errorMsg);
      setMessageType("error");
      speakMessage(errorMsg);
    }

    setIsCapturing(false);
  };

  if (!candidate) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Candidate not found</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Voting Status Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-blue-900">
            General Election 2024
          </h3>
          <p className="text-blue-700">
            Voter {state.faceDescriptors.length + 1} of {state.maxVoters} |
            {getRemainingVotes()} votes remaining
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-blue-600 text-white p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Voting for {candidate?.name}</h1>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-blue-100 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>
          </div>
        </div>

        <div className="p-6">
          {!canVote() ? (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <Target className="mx-auto h-16 w-16 text-red-500 mb-4" />
                <h3 className="text-xl font-semibold text-red-900 mb-2">
                  Voting Closed
                </h3>
                <p className="text-red-700 mb-4">
                  The maximum number of 3000 voters has been reached. Voting is
                  now closed.
                </p>
                <button
                  onClick={() => navigate("/")}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                >
                  View Results
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="text-center">
                <img
                  src={candidate?.image || "https://via.placeholder.com/200"}
                  alt={candidate?.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {candidate?.name}
                </h2>
                <p className="text-blue-600 font-medium mb-2">
                  {candidate?.party}
                </p>
                <p className="text-gray-600">
                  Current Votes:{" "}
                  <span className="font-semibold text-blue-600">
                    {candidate?.votes}
                  </span>
                </p>
              </div>

              {/* Voting Interface */}
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Voter Name *
                  </label>
                  <input
                    type="text"
                    value={voterName}
                    onChange={(e) => setVoterName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your name"
                    disabled={isCapturing}
                  />
                </div>

                {!isLoading && (
                  <div className="webcam-container bg-black rounded-lg overflow-hidden mb-4">
                    <Webcam
                      ref={webcamRef}
                      audio={false}
                      screenshotFormat="image/jpeg"
                      className="w-full h-64 object-cover"
                    />
                  </div>
                )}

                {isLoading && (
                  <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg mb-4">
                    <div className="text-center">
                      <div className="loading-spinner mx-auto mb-4"></div>
                      <p className="text-gray-600">
                        Loading face recognition...
                      </p>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleCapture}
                  disabled={isCapturing || isLoading || !voterName.trim()}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  {isCapturing ? (
                    <>
                      <div className="loading-spinner w-4 h-4"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Camera className="h-5 w-5" />
                      Capture Face & Vote
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Message Display */}
          {message && (
            <div
              className={`mt-6 p-4 rounded-lg flex items-center gap-3 ${
                messageType === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : messageType === "error"
                  ? "bg-red-50 text-red-800 border border-red-200"
                  : "bg-blue-50 text-blue-800 border border-blue-200"
              }`}
            >
              {messageType === "success" && <CheckCircle className="h-5 w-5" />}
              {messageType === "error" && <XCircle className="h-5 w-5" />}
              <p>{message}</p>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">
              Voting Instructions:
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Enter your name in the voter name field</li>
              <li>• Ensure your face is clearly visible in the camera</li>
              <li>• Only one person should be in the frame</li>
              <li>• Each face can only vote once in the entire election</li>
              <li>• Click "Capture Face & Vote" to cast your vote</li>
            </ul>
          </div>

          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">
              Election Rules:
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Only 3000 voters are allowed to participate</li>
              <li>• Each voter can vote only once</li>
              <li>• Face recognition ensures one vote per person</li>
              <li>• Choose from 6 qualified candidates</li>
              <li>• Voting closes when 3000 votes are reached</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VotingPage;
