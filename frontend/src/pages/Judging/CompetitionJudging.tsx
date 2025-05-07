import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Performance, Score } from '../../models/types';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import JudgingForm from '../../components/Judges/JudgingForm';
import { useAuth } from '../../context/AuthContext';
import '../../styles/common.css'; // для стилей формы и layout
import '../../App.css';     // для кнопок, контейнеров и таблиц

const CompetitionJudging: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const competitionId = parseInt(id || '0');
  const { user } = useAuth();

  const [streams, setStreams] = useState<any[]>([]);
  const [selectedStream, setSelectedStream] = useState<string>('');
  const [selectedGymnastId, setSelectedGymnastId] = useState<string>('');
  const [apparatuses, setApparatuses] = useState<string[]>([]);
  const [selectedApparatus, setSelectedApparatus] = useState<string>('');
  const [performance, setPerformance] = useState<Performance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const apparatusMap: { [key: string]: string } = {
    hoop: 'Обруч',
    ball: 'Мяч',
    ribbon: 'Лента',
    clubs: 'Булавы',
    rope: 'Скакалка',
    'no_apparatus': 'Б/П'
  };
  
  useEffect(() => {
    const fetchStreams = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/competitions/${competitionId}/streams-with-gymnasts`);
        setStreams(res.data);
      } catch (err) {
        setError('Ошибка при загрузке потоков');
      } finally {
        setLoading(false);
      }
    };
    fetchStreams();
  }, [competitionId]);

  const handleStreamChange = (streamId: string) => {
    setSelectedStream(streamId);
    setSelectedGymnastId('');
    setSelectedApparatus('');
    setApparatuses([]);
    setPerformance(null);
  };

  const handleGymnastChange = (gymnastId: string) => {
    setSelectedGymnastId(gymnastId);
    const stream = streams.find(s => s.id === parseInt(selectedStream));
    const gymnast = stream?.gymnasts.find((g: any) => g.id === parseInt(gymnastId));
    setApparatuses(gymnast?.apparatuses || []);
    setSelectedApparatus('');
    setPerformance(null);
  };

  const handleApparatusChange = async (apparatus: string) => {
    setSelectedApparatus(apparatus);
    try {
      const res = await axios.get<Performance[]>(`http://localhost:8080/competitions/${competitionId}/performances`);
      const perf = res.data.find(p =>
        p.gymnast_id === parseInt(selectedGymnastId) &&
        p.stream_id === parseInt(selectedStream) &&
        p.apparatus === apparatus
      );
      setPerformance(perf || null);
    } catch (err) {
      setError('Ошибка при загрузке выступлений');
    }
  };

  const handleSubmitScore = async (scoreData: Omit<Score, 'id' | 'created_at' | 'judge_id'>) => {
    try {
      await axios.post('http://localhost:8080/scores/judge', scoreData);
      alert('Оценка успешно сохранена');
    } catch (err) {
      setError('Ошибка при сохранении оценки');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="container">
        <div className="competition-header">
            <h1>Судейство</h1>
        </div>
      <div className="form-vertical">

        {/* Выбор потока */}
        <div className="form-field">
          <label htmlFor="stream">Выберите поток:</label>
          <select
            id="stream"
            value={selectedStream}
            onChange={(e) => handleStreamChange(e.target.value)}
          >
            <option value="">-- Поток --</option>
            {streams.map(s => (
              <option key={s.id} value={s.id}>
                {s.name || `Поток №${s.stream_number}`}
              </option>
            ))}
          </select>
        </div>

        {/* Выбор гимнастки */}
        {selectedStream && (
          <div className="form-field">
            <label htmlFor="gymnast">Выберите гимнастку:</label>
            <select
              id="gymnast"
              value={selectedGymnastId}
              onChange={(e) => handleGymnastChange(e.target.value)}
            >
              <option value="">-- Гимнастка --</option>
              {streams.find(s => s.id === parseInt(selectedStream))?.gymnasts.map((g: any) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.birth_year})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Выбор предмета */}
        {apparatuses.length > 0 && (
          <div className="form-field">
            <label htmlFor="apparatus">Выберите предмет:</label>
            <select
              id="apparatus"
              value={selectedApparatus}
              onChange={(e) => handleApparatusChange(e.target.value)}
            >
              <option value="">-- Предмет --</option>
              {apparatuses.map(a => (
                <option key={a} value={a}>
                    {apparatusMap[a] || a}
                </option>
                ))}

            </select>
          </div>
        )}

        {/* Форма выставления оценки */}
        {performance && (
          <div className="section-container">
            <JudgingForm
              performance={performance}
              userId={user?.id || 0}
              competitionId={competitionId}
              onSubmit={handleSubmitScore}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CompetitionJudging;
