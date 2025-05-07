import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Performance, Score } from '../../models/types';
import '../../styles/common.css';
import '../../App.css';

interface JudgingFormProps {
  performance: Performance;
  userId: number;
  competitionId: number;
  existingScores?: Score[];
  onSubmit: (data: Omit<Score, 'id' | 'created_at' | 'judge_id'>) => void;
  onCancel?: () => void;
}

const JudgingForm: React.FC<JudgingFormProps> = ({
  performance,
  userId,
  competitionId,
  existingScores = [],
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    role_id: 0,
    score: 0
  });

  const [brigadeCode, setBrigadeCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJudgeAndRole = async () => {
      try {
        const res = await axios.get<{
          role_id: number;
          code: string;
        }>(
          `http://localhost:8080/judges/user/${userId}/competitions/${competitionId}/role`
        );

        setFormData(prev => ({
          ...prev,
          role_id: res.data.role_id
        }));

        setBrigadeCode(res.data.code);
      } catch (err) {
        console.error('Ошибка при получении роли судьи:', err);
        setError('Не удалось определить вашу роль в этом соревновании.');
      }
    };

    fetchJudgeAndRole();
  }, [userId, competitionId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      score: parseFloat(value)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.score < 0 || formData.score > 10) {
      setError('Оценка должна быть в диапазоне от 0 до 10');
      return;
    }

    const existingScore = existingScores.find(
      s => s.role_id === formData.role_id
    );

    if (existingScore) {
      setError('Вы уже отправили оценку для этой бригады');
      return;
    }

    setError('');

    onSubmit({
      performance_id: performance.id,
      role_id: formData.role_id,
      gymnast_id: performance.gymnast_id,
      competition_id: competitionId,
      apparatus: performance.apparatus,
      score: formData.score
    });
  };

  return (
    <form onSubmit={handleSubmit} className="judging-form form-vertical">

      <div className="form-field">
        <label>Ваша бригада:</label>
        <input type="text" value={brigadeCode} disabled />
      </div>

      <div className="form-field">
        <label htmlFor="score">Оценка (0–10):</label>
        <input
          id="score"
          type="number"
          name="score"
          min="0"
          max="10"
          step="0.1"
          value={formData.score}
          onChange={handleChange}
          required
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="form-actions">
        <button type="submit" className="btn add">
            Отправить оценку
        </button>
        {onCancel && (
            <button type="button" onClick={onCancel} className="btn neutral-btn">
            Отмена
            </button>
        )}
        </div>

    </form>
  );
};

export default JudgingForm;
