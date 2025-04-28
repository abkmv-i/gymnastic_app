import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Competition, Gymnast, AgeCategory } from '../models/types';
import LoadingSpinner from '../components/LoadingSpinner';
import Tabs from '../components/Tabs';
import CompetitionForm from '../components/CompetitionForm';
import GymnastsTable from '../components/GymnastsTable';
import { useAuth } from '../context/AuthContext';
import AgeCategoriesManager from '../components/AgeCategoriesManager';

import '../App.css';

const CompetitionEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [gymnasts, setGymnasts] = useState<Gymnast[]>([]);
  const [ageCategories, setAgeCategories] = useState<AgeCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [compRes, gymnastsRes, categoriesRes] = await Promise.all([
          axios.get<Competition>(`http://localhost:8080/competitions/${id}`),
          axios.get<Gymnast[]>(`http://localhost:8080/competitions/${id}/gymnasts`),
          axios.get<AgeCategory[]>(`http://localhost:8080/competitions/${id}/age-categories`)
        ]);

        setCompetition(compRes.data);
        setGymnasts(gymnastsRes.data);
        setAgeCategories(categoriesRes.data);
      } catch (err) {
        setError('Не удалось загрузить данные соревнования');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (competitionData: Omit<Competition, 'id' | 'created_at'>) => {
    try {
      await axios.put(`http://localhost:8080/competitions/${id}`, competitionData);
      navigate(`/competitions/${id}`);
    } catch (err) {
      setError('Не удалось обновить соревнование');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!competition) return <div>Соревнование не найдено</div>;

  return (
    <div className="container">
      <div className="competition-header">
        <h1>Редактирование соревнования</h1>
        <div className="competition-meta">
          <span>Дата: {new Date(competition.date).toLocaleDateString()}</span>
          <span>Место: {competition.location}</span>
          <span>Статус: {competition.status}</span>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <Tabs
        tabs={[
          { id: 'details', label: 'Основная информация' },
          { id: 'gymnasts', label: 'Гимнастки' },
          { id: 'categories', label: 'Возрастные категории' },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="tab-content">
        {activeTab === 'details' && (
          <CompetitionForm 
            initialData={competition} 
            onSubmit={handleSubmit} 
          />
        )}

        {activeTab === 'gymnasts' && (
          <GymnastsTable 
            gymnasts={gymnasts} 
            ageCategories={ageCategories}
            competitionId={competition.id}
            onUpdate={() => {
              axios.get<Gymnast[]>(`http://localhost:8080/competitions/${id}/gymnasts`)
                  .then(res => setGymnasts(res.data));
            }}
            onEdit={(gymnast) => navigate(`/gymnasts/${gymnast.id}/edit`)}
            onDelete={(gymnastId) => {
              if (window.confirm('Вы уверены, что хотите удалить гимнастку?')) {
                axios.delete(`http://localhost:8080/gymnasts/${gymnastId}`)
                  .then(() => {
                    setGymnasts(gymnasts.filter(g => g.id !== gymnastId));
                  });
              }
            }}
          />
        )}

        {activeTab === 'categories' && (
          <AgeCategoriesManager 
              ageCategories={ageCategories} 
              setAgeCategories={setAgeCategories}
              competitionId={competition.id}
          />
        )}
      </div>
    </div>
  );
};

export default CompetitionEdit;
