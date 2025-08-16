import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { VotingProvider } from "./context/VotingContext";
import Dashboard from "./components/Dashboard";
import VotingPage from "./components/VotingPage";
import "./App.css";

function App() {
  return (
    <VotingProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-blue-600 text-white shadow-lg">
            <div className="container mx-auto px-4 py-4">
              <h1 className="text-2xl font-bold">
                Face Recognition Voting System
              </h1>
            </div>
          </header>

          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/vote/:candidateId" element={<VotingPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </VotingProvider>
  );
}

export default App;
