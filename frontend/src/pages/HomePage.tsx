import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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

  // При загрузке компонента получаем соревнования
  useEffect(() => {
    fetchCompetitions();
  }, []);

  const fetchCompetitions = async () => {
    try {
      // Предполагаем, что сервер работает на localhost:8080
      // и эндпоинт /competitions возвращает массив объектов 
      // [{id, name, date, location}, ...]
      const response = await axios.get<Competition[]>(
        "http://localhost:8080/competitions"
      );
      setCompetitions(response.data);
    } catch (error) {
      console.error("Ошибка при получении соревнований:", error);
    }
  };

  // Обработчик выбора соревнования
  const handleCompetitionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCompetition(e.target.value);
  };

  // Кнопка "Перейти"
  const handleGoToCompetition = () => {
    if (!selectedCompetition) return;
    // Например, переходим по маршруту /competition/:id
    navigate(`/competition/${selectedCompetition}`);
  };

  return (
    <div>
      <h1>Главная страница</h1>

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

      <button 
        type="button" 
        onClick={handleGoToCompetition} 
        disabled={!selectedCompetition}
      >
        Перейти
      </button>

      {selectedCompetition && (
        <p>
          Вы выбрали соревнование с ID: <strong>{selectedCompetition}</strong>
        </p>
      )}
    </div>
  );
};

export default HomePage;
