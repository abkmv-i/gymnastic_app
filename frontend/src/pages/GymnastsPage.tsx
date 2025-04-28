import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Gymnast } from '../models/types';
import LoadingSpinner from '../components/LoadingSpinner';
import './GymnastsPage.css';

const GymnastsPage: React.FC = () => {
  const [gymnasts, setGymnasts] = useState<Gymnast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGymnasts = async () => {
      try {
        const response = await axios.get<Gymnast[]>('/gymnasts');
        setGymnasts(response.data);
      } catch (err) {
        setError('Failed to fetch gymnasts');
      } finally {
        setLoading(false);
      }
    };

    fetchGymnasts();
  }, []);

  const handleAddGymnast = () => {
    navigate('/gymnasts/new');
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="gymnasts-page">
      <div className="header">
        <h1>Gymnasts</h1>
        <button onClick={handleAddGymnast}>Add Gymnast</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Birth Year</th>
            <th>Club</th>
            <th>City</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {gymnasts.map(gymnast => (
            <tr key={gymnast.id}>
              <td>{gymnast.name}</td>
              <td>{gymnast.birth_year}</td>
              <td>{gymnast.club || '-'}</td>
              <td>{gymnast.city || '-'}</td>
              <td>
                <button onClick={() => navigate(`/gymnasts/${gymnast.id}`)}>
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GymnastsPage;