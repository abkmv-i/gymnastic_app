import React from "react";
import { Routes, Route } from "react-router-dom";
import Authorization from "./pages/Authorization";
import Registration from "./pages/Registration";
import HomePage from "./pages/HomePage";
import CompetitionDetails from "./pages/CompetitionDetails";
import CompetitionJudging from "./pages/CompetitionJudging";
import CompetitionResults from "./pages/CompetitionResults";
import './App.css';
function App() {
  return (
    <div className="container">
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Authorization />} />
      <Route path="/register" element={<Registration />} />
      <Route path="/competition/:id" element={<CompetitionDetails />} />
      <Route path="/competition/:id/judge" element={<CompetitionJudging />} />
      <Route path="/competition/:id/results" element={<CompetitionResults />} />
    </Routes>
    </div>
  );
}

export default App;
