// CompetitionDetails.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

interface Gymnast {
  id: number;
  name: string;
  birth_year: number;
  club: string;
}

interface Judge {
  id: number;
  name: string;
  category: string;
}

interface CompetitionData {
  id: number;
  name: string;
  date: string;
  location: string;
  gymnasts: Gymnast[];
  judges: Judge[];
}

const CompetitionDetails: React.FC = () => {
  const { id } = useParams(); // competition ID из URL
  const navigate = useNavigate();

  const [competition, setCompetition] = useState<CompetitionData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (id) {
      fetchCompetitionDetails(id);
    }
  }, [id]);

  // Запрос деталей соревнования
  const fetchCompetitionDetails = async (competitionId: string) => {
    try {
      const response = await axios.get<CompetitionData>(
        `http://localhost:8080/competitions/${competitionId}`
      );
      setCompetition(response.data);
    } catch (error) {
      console.error("Ошибка при получении информации о соревновании:", error);
    } finally {
      setLoading(false);
    }
  };

  // Переход на страницу судейства
  const handleJudgeClick = () => {
    if (!competition) return;
    navigate(`/competition/${competition.id}/judge`);
  };

  // Переход на страницу результатов (протоколов)
  const handleProtocolsClick = () => {
    if (id) {
      navigate(`/competition/${id}/results`);
    }
  };

  // Переход к выбору соревнований (обычно это главная страница "/")
  const handleBackToCompetitions = () => {
    navigate("/");
  };

  if (loading) {
    return <p>Загрузка...</p>;
  }

  if (!competition) {
    return <p>Соревнование не найдено.</p>;
  }

  return (
    <div>
      <h2>Детальная информация о соревновании</h2>
      
      <p>Название: {competition.name}</p>
      <p>Дата: {competition.date}</p>
      <p>Место: {competition.location}</p>

      <h3>Список гимнасток</h3>
      {competition.gymnasts.length > 0 ? (
        <table
          border={1}
          cellPadding={5}
          style={{ borderCollapse: "collapse", marginBottom: "16px" }}
        >
          <thead>
            <tr>
              <th>Имя</th>
              <th>Год рождения</th>
              <th>Клуб</th>
            </tr>
          </thead>
          <tbody>
            {competition.gymnasts.map((gymnast) => (
              <tr key={gymnast.id}>
                <td>{gymnast.name}</td>
                <td>{gymnast.birth_year}</td>
                <td>{gymnast.club}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Гимнасток нет.</p>
      )}

      <div style={{ marginTop: "20px" }}>
        <button onClick={handleJudgeClick} style={{ marginRight: "10px" }}>
          Судить
        </button>
        <button onClick={handleProtocolsClick} style={{ marginRight: "10px" }}>
          Протоколы
        </button>
        <button onClick={handleBackToCompetitions}>
          К выбору соревнований
        </button>
      </div>
    </div>
  );
};

export default CompetitionDetails;
