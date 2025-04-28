// CompetitionResults.tsx (страница результатов)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Result, Gymnast, AgeCategory} from '../models/types';
import ResultsTable from '../components/ResultsTable';
import LoadingSpinner from '../components/LoadingSpinner';
import * as XLSX from 'xlsx';
import { useAuth } from '../context/AuthContext';

const CompetitionResults: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [results, setResults] = useState<Result[]>([]);
  const [gymnasts, setGymnasts] = useState<Gymnast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [competitionName, setCompetitionName] = useState('');
  const [ageCategories, setAgeCategories] = useState<AgeCategory[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resultsRes, gymnastsRes, competitionRes, ageCategoriesRes] = await Promise.all([
          axios.get<Result[]>(`/competitions/${id}/results`),
          axios.get<Gymnast[]>(`/competitions/${id}/gymnasts`),
          axios.get<{ name: string }>(`/competitions/${id}`),
          axios.get<AgeCategory[]>('http://localhost:8080/age-categories')
        ]);

        setResults(resultsRes.data);
        setGymnasts(gymnastsRes.data);
        setCompetitionName(competitionRes.data.name);
        setAgeCategories(ageCategoriesRes.data);
      } catch (err) {
        setError('Failed to fetch results');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleExport = () => {
    const data = results.map(result => {
      const gymnast = gymnasts.find(g => g.id === result.gymnast_id);
      return {
        'Rank': result.rank,
        'Gymnast': gymnast?.name || 'Unknown',
        'Total Score': result.total_score,
        'A Score': result.a_score,
        'E Score': result.e_score,
        'DA Score': result.da_score,
        'DB Score': result.db_score || '-',
        'Penalties': result.penalties || 0,
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Results');
    XLSX.writeFile(wb, `${competitionName}_Results.xlsx`);
  };

  const handleCalculateResults = async () => {
    try {
      await axios.post(`/competitions/${id}/calculate-results`);
      navigate(0); // Refresh the page
    } catch (err) {
      setError('Failed to calculate results');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="container">
      <div className="header">
        <h1>Results: {competitionName}</h1>
        <div className="action-buttons">
          <button onClick={handleExport} className="btn-secondary">
            Export to Excel
          </button>
          {user?.role === 'admin' && (
            <button onClick={handleCalculateResults} className="btn-primary">
              Calculate Results
            </button>
          )}
        </div>
      </div>

      <ResultsTable results={results} gymnasts={gymnasts} ageCategories={ageCategories}/>
    </div>
  );
};

export default CompetitionResults;