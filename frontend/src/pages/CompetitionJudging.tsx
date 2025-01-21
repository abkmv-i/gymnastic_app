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

const CompetitionJudging: React.FC = () => {
  const { id } = useParams(); // competition ID из URL
  const navigate = useNavigate();

  const [competition, setCompetition] = useState<CompetitionData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Состояние для формы
  const [selectedGymnast, setSelectedGymnast] = useState<string>("");
  const [apparatus, setApparatus] = useState<string>("");
  const [A_score, setScoreA] = useState<string>("");
  const [E_score, setScoreE] = useState<string>("");
  const [DA_score, setScoreDA] = useState<string>("");

  useEffect(() => {
    if (id) {
      fetchCompetitionDetails(id);
    }
  }, [id]);

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

  // Отправка результатов
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedGymnast || !A_score || !E_score || !DA_score) {
      alert("Пожалуйста, заполните все поля и выберите гимнастку.");
      return;
    }

    try {
      await axios.post(`http://localhost:8080/scores/judge`, {
        gymnastId: selectedGymnast,
        judge_id: "1", // Пример, в реальном проекте берется из контекста/логина
        apparatus,
        A_score,
        E_score,
        DA_score,
      });

      alert("Оценки успешно отправлены!");

      // Очистка формы
      setSelectedGymnast("");
      setApparatus("");
      setScoreA("");
      setScoreE("");
      setScoreDA("");
    } catch (error) {
      console.error("Ошибка при отправке результатов судейства:", error);
      alert("Ошибка при отправке результатов судейства.");
    }
  };

  const handleProtocolsClick = () => {
    // Переход на страницу с результатами (протоколами)
    if (id) {
      navigate(`/competition/${id}/results`);
    }
  };

  const handleBackClick = () => {
    // Возврат к странице соревнования
    if (id) {
      navigate(`/competition/${id}`);
    }
  };

  if (loading) {
    return <p>Загрузка...</p>;
  }

  if (!competition) {
    return <p>Соревнование не найдено.</p>;
  }

  return (
    <div>
      <h2>Судейство соревнования: {competition.name}</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="gymnastSelect">Выберите гимнастку:</label>
          <select
            id="gymnastSelect"
            value={selectedGymnast}
            onChange={(e) => setSelectedGymnast(e.target.value)}
          >
            <option value="">-- Выберите --</option>
            {competition.gymnasts.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name} (Клуб: {g.club})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="apparatusSelect">Выберите предмет:</label>
          <select
            id="apparatusSelect"
            value={apparatus}
            onChange={(e) => setApparatus(e.target.value)}
          >
            <option value="">-- Выберите --</option>
            <option value="hoop">Обруч</option>
            <option value="ball">Мяч</option>
            <option value="clubs">Булавы</option>
            <option value="ribbon">Лента</option>
          </select>
        </div>

        <div>
          <label htmlFor="scoreA">Оценка бригады A:</label>
          <input
            id="scoreA"
            type="number"
            step="0.1"
            value={A_score}
            onChange={(e) => setScoreA(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="scoreE">Оценка бригады E:</label>
          <input
            id="scoreE"
            type="number"
            step="0.1"
            value={E_score}
            onChange={(e) => setScoreE(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="scoreDA">Оценка бригады DA:</label>
          <input
            id="scoreDA"
            type="number"
            step="0.1"
            value={DA_score}
            onChange={(e) => setScoreDA(e.target.value)}
          />
        </div>

        <button type="submit">Отправить результаты</button>
      </form>

      <div style={{ marginTop: "20px" }}>
        <button onClick={handleProtocolsClick}>Протоколы</button>
        <button onClick={handleBackClick}>Назад</button>
      </div>
    </div>
  );
};

export default CompetitionJudging;
