import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useVoting } from "../context/VotingContext";
import {
  Vote,
  Edit,
  Trash2,
  Trophy,
  Camera,
  Upload,
  X,
  Users,
  Eye,
} from "lucide-react";
import Webcam from "react-webcam";

function CandidateList() {
  const { state, deleteCandidate, updateCandidate } = useVoting();
  const navigate = useNavigate();
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", party: "", image: "" });
  const [showEditCamera, setShowEditCamera] = useState(false);
  const [editCapturedImage, setEditCapturedImage] = useState(null);
  const [showVotersList, setShowVotersList] = useState(null);
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleStartVoting = (candidateId) => {
    navigate(`/vote/${candidateId}`);
  };

  const handleEdit = (candidate) => {
    setEditingCandidate(candidate.id);
    setEditForm({
      name: candidate.name,
      party: candidate.party || "",
      image: candidate.image,
    });
    setEditCapturedImage(null);
    setShowEditCamera(false);
  };

  const handleSaveEdit = () => {
    updateCandidate({
      ...state.candidates.find((c) => c.id === editingCandidate),
      name: editForm.name,
      party: editForm.party,
      image: editCapturedImage || editForm.image,
    });
    setEditingCandidate(null);
    setEditCapturedImage(null);
  };

  const captureEditPhoto = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setEditCapturedImage(imageSrc);
      setShowEditCamera(false);
    }
  };

  const handleEditFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditCapturedImage(event.target.result);
        setShowEditCamera(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancelEdit = () => {
    setEditingCandidate(null);
    setEditForm({ name: "", party: "", image: "" });
  };

  const handleDelete = (candidateId) => {
    if (window.confirm("Are you sure you want to delete this candidate?")) {
      deleteCandidate(candidateId);
    }
  };

  const getCandidateVoters = (candidateId) => {
    return state.votingHistory
      .filter((vote) => vote.candidateId === candidateId)
      .map((vote, index) => ({
        ...vote,
        voterNumber: state.votingHistory.findIndex((v) => v.id === vote.id) + 1,
      }))
      .sort((a, b) => a.voterNumber - b.voterNumber);
  };

  const toggleVotersList = (candidateId) => {
    setShowVotersList(showVotersList === candidateId ? null : candidateId);
  };

  if (state.candidates.length === 0) {
    return (
      <div className="text-center py-12">
        <Trophy className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No candidates
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by adding your first candidate.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.candidates.map((candidate) => (
          <div
            key={candidate.id}
            className="candidate-card bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="p-6">
              {editingCandidate === candidate.id ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Candidate name"
                  />
                  <input
                    type="text"
                    value={editForm.party}
                    onChange={(e) =>
                      setEditForm({ ...editForm, party: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Political party"
                  />

                  {/* Photo editing section */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Update Photo:
                    </label>

                    {!showEditCamera && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowEditCamera(true)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                        >
                          <Camera className="h-3 w-3" />
                          Camera
                        </button>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                        >
                          <Upload className="h-3 w-3" />
                          Upload
                        </button>
                      </div>
                    )}

                    {showEditCamera && (
                      <div className="space-y-2">
                        <div className="webcam-container bg-black rounded-lg overflow-hidden">
                          <Webcam
                            ref={webcamRef}
                            audio={false}
                            screenshotFormat="image/jpeg"
                            className="w-full h-32 object-cover"
                          />
                        </div>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={captureEditPhoto}
                            className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
                          >
                            Capture
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowEditCamera(false)}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {editCapturedImage && (
                      <div className="relative">
                        <img
                          src={editCapturedImage}
                          alt="New"
                          className="w-full h-24 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => setEditCapturedImage(null)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleEditFileUpload}
                    className="hidden"
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEdit}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <img
                      src={candidate.image || "https://via.placeholder.com/60"}
                      alt={candidate.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex gap-1">
                      <button
                        onClick={() => toggleVotersList(candidate.id)}
                        className="p-2 text-gray-600 hover:text-green-600 transition-colors"
                        title="View voters"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(candidate)}
                        className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                        title="Edit candidate"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(candidate.id)}
                        className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                        title="Delete candidate"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {candidate.name}
                  </h3>
                  <p className="text-sm text-blue-600 font-medium mb-3">
                    {candidate.party || "Independent"}
                  </p>

                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="text-center">
                      <span className="text-2xl font-bold text-blue-600">
                        {candidate.votes}
                      </span>
                      <p className="text-sm text-gray-600">Total Votes</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => handleStartVoting(candidate.id)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      <Vote className="h-4 w-4" />
                      Vote for {candidate.name.split(" ")[0]}
                    </button>

                    {candidate.votes > 0 && (
                      <button
                        onClick={() => toggleVotersList(candidate.id)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                      >
                        <Users className="h-4 w-4" />
                        View {candidate.votes} Voter
                        {candidate.votes > 1 ? "s" : ""}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Voter List Modal */}
      {showVotersList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                Voters for{" "}
                {state.candidates.find((c) => c.id === showVotersList)?.name}
              </h3>
              <button
                onClick={() => setShowVotersList(null)}
                className="text-white hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {getCandidateVoters(showVotersList).length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Voter No.
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vote Time
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getCandidateVoters(showVotersList).map((voter) => (
                        <tr key={voter.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-blue-600">
                            {voter.voterNumber}.
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {voter.voterName}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {new Date(voter.timestamp).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-gray-500">
                    No voters yet for this candidate
                  </p>
                </div>
              )}
            </div>

            <div className="bg-gray-50 px-4 py-3 flex justify-end">
              <button
                onClick={() => setShowVotersList(null)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CandidateList;
