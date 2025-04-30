import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import {Competition} from '../models/types';
import CompetitionCard from '../components/CompetitionCard';
import LoadingSpinner from '../components/LoadingSpinner';
import {useAuth} from '../context/AuthContext';
import './HomePage.css'; // Подключаем стили

const HomePage: React.FC = () => {
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const {user} = useAuth();

    useEffect(() => {
        const fetchCompetitions = async () => {
            try {
                const response = await axios.get<Competition[]>('http://localhost:8080/competitions');
                setCompetitions(response.data);
            } catch (err) {
                setError('Не удалось загрузить соревнования');
            } finally {
                setLoading(false);
            }
        };

        fetchCompetitions();
    }, []);

    const handleCreateCompetition = () => {
        navigate('/competitions/new');
    };

    if (loading) return <LoadingSpinner/>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="container">
            <div className="competition-header">
                <h1>Cоревнования</h1>
            </div>
            {/* {user?.role === 'admin' && ( */}
            <button
                onClick={handleCreateCompetition}
                className="create-button"
                aria-label="Создать новое соревнование"
            >
                <span className="button-icon">+</span>
                Новое соревнование
            </button>
            {/* )} */}

            <div className="competitions-grid">
                {competitions.length > 0 ? (
                    competitions.map(competition => (
                        <CompetitionCard
                            key={competition.id}
                            competition={competition}
                            onClick={() => navigate(`/competitions/${competition.id}`)}
                        />
                    ))
                ) : (
                    <div className="empty-state">
                        <p>Нет доступных соревнований</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomePage;