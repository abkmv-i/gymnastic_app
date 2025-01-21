import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css"

interface Competition {
  id: number;
  name: string;
  date: string;
  location: string;
}

const HomePage: React.FC = () => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<string>("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const fetchCompetitions = async () => {
    try {
      const response = await axios.get<Competition[]>(
        "http://localhost:8080/competitions"
      );
      setCompetitions(response.data);
    } catch (error) {
      console.error("Ошибка при получении соревнований:", error);
    }
  };

  const handleCompetitionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCompetition(e.target.value);
  };

  const handleGoToCompetition = () => {
    if (!selectedCompetition) return;
    navigate(`/competition/${selectedCompetition}`);
  };

  return (
    <div className="home-page">
      <h1>Главная страница</h1>
      <div className="select-competition">
        <label htmlFor="competitionSelect">Выберите соревнование: </label>
        <select
            id="competitionSelect"
            value={selectedCompetition}
            onChange={handleCompetitionChange}
        >
            <option value="">-- Выберите --</option>
            {competitions.map((competition) => (
            <option key={competition.id} value={competition.id}>
                {competition.name} ({competition.date}, {competition.location})
            </option>
            ))}
        </select>
      </div>

      <button 
      className="nav-buttons" 
        type="button" 
        onClick={handleGoToCompetition} 
        disabled={!selectedCompetition}
      >
        Перейти
      </button>
    </div>
  );
};

export default HomePage;
