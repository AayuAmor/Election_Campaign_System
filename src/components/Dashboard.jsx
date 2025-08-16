import React, { useState } from "react";
import { useVoting } from "../context/VotingContext";
import CandidateList from "./CandidateList";
import AddCandidateForm from "./AddCandidateForm";
import ResultsChart from "./ResultsChart";
import { BarChart3, Users, Plus, Vote, Target } from "lucide-react";

function Dashboard() {
  const { state, getRemainingVotes, getVotingProgress } = useVoting();
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState("candidates");

  // Filter valid candidates
  const validCandidates = state.candidates.filter(
    (candidate) =>
      candidate.name &&
      candidate.name.trim() !== "" &&
      typeof candidate.votes === "number"
  );

  const totalVotes = validCandidates.reduce(
    (sum, candidate) => sum + candidate.votes,
    0
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Election Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-blue-900 mb-2">
            Election System
          </h2>
          <p className="text-blue-700 mb-4">
            Choose your representative from 6 candidates
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white rounded-lg p-3">
              <span className="font-semibold text-blue-900">
                Total Voters Allowed:
              </span>
              <span className="text-blue-700 ml-2">{state.maxVoters}</span>
            </div>
            <div className="bg-white rounded-lg p-3">
              <span className="font-semibold text-blue-900">Votes Cast:</span>
              <span className="text-blue-700 ml-2">
                {state.faceDescriptors.length}
              </span>
            </div>
            <div className="bg-white rounded-lg p-3">
              <span className="font-semibold text-blue-900">Remaining:</span>
              <span className="text-blue-700 ml-2">{getRemainingVotes()}</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${getVotingProgress()}%` }}
              ></div>
            </div>
            <p className="text-sm text-blue-700 mt-2">
              Voting Progress: {getVotingProgress()}%
            </p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Candidates</p>
              <p className="text-2xl font-bold text-gray-900">
                {validCandidates.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Votes</p>
              <p className="text-2xl font-bold text-gray-900">{totalVotes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <Vote className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Voters</p>
              <p className="text-2xl font-bold text-gray-900">
                {state.faceDescriptors.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Remaining</p>
              <p className="text-2xl font-bold text-gray-900">
                {getRemainingVotes()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Voting Status Alert */}
      {getRemainingVotes() === 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <Target className="h-5 w-5 text-red-500 mr-2" />
            <h3 className="text-sm font-medium text-red-800">
              Voting Complete
            </h3>
          </div>
          <p className="text-sm text-red-700 mt-1">
            Maximum number of voters (3000) has been reached. No more votes can
            be cast.
          </p>
        </div>
      )}

      {getRemainingVotes() <= 10 && getRemainingVotes() > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <Target className="h-5 w-5 text-yellow-500 mr-2" />
            <h3 className="text-sm font-medium text-yellow-800">Almost Full</h3>
          </div>
          <p className="text-sm text-yellow-700 mt-1">
            Only {getRemainingVotes()} votes remaining out of 3000 total voters
            allowed.
          </p>
        </div>
      )}

      {/* Demo Controls */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-medium text-gray-800">Demo Controls</h3>
            <p className="text-sm text-gray-600">
              Reset all voting data for testing
            </p>
          </div>
          <button
            onClick={() => {
              if (
                window.confirm(
                  "Are you sure you want to reset all voting data? This cannot be undone."
                )
              ) {
                localStorage.removeItem("votingAppState");
                window.location.reload();
              }
            }}
            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
          >
            Reset All Data
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab("candidates")}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === "candidates"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Manage Elections
            </button>
            <button
              onClick={() => setActiveTab("results")}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === "results"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Election Results
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "candidates" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Election Candidates
                  </h2>
                  <p className="text-gray-600">
                    6 candidates running for election
                  </p>
                </div>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add Candidate
                </button>
              </div>

              {showAddForm && (
                <div className="mb-8">
                  <AddCandidateForm onClose={() => setShowAddForm(false)} />
                </div>
              )}

              <CandidateList />
            </div>
          )}

          {activeTab === "results" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Live Election Results
                </h2>
                <div className="text-sm text-gray-600">
                  Total Voters: {state.faceDescriptors.length} /{" "}
                  {state.maxVoters}
                </div>
              </div>
              <ResultsChart />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
