import React, { createContext, useContext, useReducer, useEffect } from "react";

const VotingContext = createContext();

const initialState = {
  candidates: [
    {
      id: 1,
      name: "John Anderson",
      votes: 0,
      image: "https://via.placeholder.com/150",
      party: "Democratic Party",
    },
    {
      id: 2,
      name: "Sarah Mitchell",
      votes: 0,
      image: "https://via.placeholder.com/150",
      party: "Republican Party",
    },
    {
      id: 3,
      name: "Michael Rodriguez",
      votes: 0,
      image: "https://via.placeholder.com/150",
      party: "Independent",
    },
    {
      id: 4,
      name: "Emily Chen",
      votes: 0,
      image: "https://via.placeholder.com/150",
      party: "Green Party",
    },
    {
      id: 5,
      name: "David Thompson",
      votes: 0,
      image: "https://via.placeholder.com/150",
      party: "Liberal Party",
    },
    {
      id: 6,
      name: "Maria Gonzalez",
      votes: 0,
      image: "https://via.placeholder.com/150",
      party: "Progressive Party",
    },
  ],
  voters: [],
  faceDescriptors: [],
  votingHistory: [],
  maxVoters: 100,
  totalVotersAllowed: 100,
};

function votingReducer(state, action) {
  switch (action.type) {
    case "ADD_CANDIDATE":
      return {
        ...state,
        candidates: [...state.candidates, action.payload],
      };

    case "UPDATE_CANDIDATE":
      return {
        ...state,
        candidates: state.candidates.map((candidate) =>
          candidate.id === action.payload.id ? action.payload : candidate
        ),
      };

    case "DELETE_CANDIDATE":
      return {
        ...state,
        candidates: state.candidates.filter(
          (candidate) => candidate.id !== action.payload
        ),
      };

    case "CAST_VOTE":
      return {
        ...state,
        candidates: state.candidates.map((candidate) =>
          candidate.id === action.payload.candidateId
            ? { ...candidate, votes: candidate.votes + 1 }
            : candidate
        ),
        faceDescriptors: [
          ...state.faceDescriptors,
          action.payload.faceDescriptor,
        ],
        votingHistory: [
          ...state.votingHistory,
          {
            id: Date.now(),
            candidateId: action.payload.candidateId,
            timestamp: new Date().toISOString(),
            voterName: action.payload.voterName,
          },
        ],
      };

    case "LOAD_STATE":
      return action.payload;

    default:
      return state;
  }
}

export function VotingProvider({ children }) {
  const [state, dispatch] = useReducer(votingReducer, initialState);

  useEffect(() => {
    const savedState = localStorage.getItem("votingAppState");
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        dispatch({ type: "LOAD_STATE", payload: parsedState });
      } catch (error) {
        console.error("Error loading saved state:", error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("votingAppState", JSON.stringify(state));
  }, [state]);

  const addCandidate = (candidate) => {
    const newCandidate = {
      ...candidate,
      id: Date.now(),
      votes: 0,
    };
    dispatch({ type: "ADD_CANDIDATE", payload: newCandidate });
  };

  const updateCandidate = (candidate) => {
    dispatch({ type: "UPDATE_CANDIDATE", payload: candidate });
  };

  const deleteCandidate = (candidateId) => {
    dispatch({ type: "DELETE_CANDIDATE", payload: candidateId });
  };

  const castVote = (candidateId, faceDescriptor, voterName) => {
    dispatch({
      type: "CAST_VOTE",
      payload: { candidateId, faceDescriptor, voterName },
    });
  };

  const checkIfFaceHasVoted = (faceDescriptor, threshold = 0.6) => {
    return state.faceDescriptors.some((storedDescriptor) => {
      if (!storedDescriptor || !faceDescriptor) return false;

      if (
        typeof storedDescriptor === "string" ||
        typeof faceDescriptor === "string"
      ) {
        return storedDescriptor === faceDescriptor;
      }

      let distance = 0;
      for (let i = 0; i < faceDescriptor.length; i++) {
        distance += Math.pow(faceDescriptor[i] - storedDescriptor[i], 2);
      }
      distance = Math.sqrt(distance);

      return distance < threshold;
    });
  };

  const canVote = () => {
    return state.faceDescriptors.length < state.maxVoters;
  };

  const getRemainingVotes = () => {
    return state.maxVoters - state.faceDescriptors.length;
  };

  const getVotingProgress = () => {
    return ((state.faceDescriptors.length / state.maxVoters) * 100).toFixed(1);
  };

  const value = {
    state,
    addCandidate,
    updateCandidate,
    deleteCandidate,
    castVote,
    checkIfFaceHasVoted,
    canVote,
    getRemainingVotes,
    getVotingProgress,
  };

  return (
    <VotingContext.Provider value={value}>{children}</VotingContext.Provider>
  );
}

export function useVoting() {
  const context = useContext(VotingContext);
  if (!context) {
    throw new Error("useVoting must be used within a VotingProvider");
  }
  return context;
}
