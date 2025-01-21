import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../App.css"

interface ProtocolRow {
  id: number;
  gymnast_name: string;
  gymnast_id: number;
  competition_id: number;
  total_score: string; 
  rank: number;
  a_score: string;
  e_score: string;
  da_score: string;
  created_at: string; 
}

const CompetitionResults: React.FC = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();

  const [results, setResults] = useState<ProtocolRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (id) {
      fetchProtocols(id);
    }
  }, [id]);

  const fetchProtocols = async (competitionId: string) => {
    try {
      const response = await axios.get<ProtocolRow[]>(
        `http://localhost:8080/results/protocols?competition_id=${competitionId}`
      );
      setResults(response.data);
    } catch (err) {
      console.error("Ошибка при получении протоколов:", err);
      setError("Не удалось загрузить протоколы.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoToCompetition = () => {
    if (id) {
      navigate(`/competition/${id}`);
    }
  };
  const handleBackToCompetitions = () => {
    navigate("/");
  };

  const handleGoToJudging = () => {
    if (id) {
      navigate(`/competition/${id}/judge`);
    }
  };

  if (loading) {
    return <p>Загрузка результатов...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="home-page">
      <h1>Результаты соревнования</h1>

      {results.length === 0 ? (
        <p>Пока нет данных о результатах.</p>
      ) : (
        <table border={1} cellPadding={5} style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Место</th>
              <th>Гимнастка</th>
              <th>Общая оценка</th>
              <th>A_score</th>
              <th>E_score</th>
              <th>DA_score</th>

            </tr>
          </thead>
          <tbody>
            {results.map((row) => (
              <tr key={row.id}>
                <td>{row.rank}</td>
                <td>{row.gymnast_name}</td>
                <td>{row.total_score}</td>
                <td>{row.a_score}</td>
                <td>{row.e_score}</td>
                <td>{row.da_score}</td>

              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="nav-buttons" style={{ marginTop: "20px" }}>
      <button onClick={handleBackToCompetitions}>
          К выбору соревнований
        </button>
        <button onClick={handleGoToCompetition}>К соревнованию</button>
        <button onClick={handleGoToJudging} style={{ marginLeft: "10px" }}>
          Судить
        </button>
      </div>
    </div>
  );
};

export default CompetitionResults;
