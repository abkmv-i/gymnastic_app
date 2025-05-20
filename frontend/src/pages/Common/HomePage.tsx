import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import {Competition} from '../../models/types';
import CompetitionCard from '../../components/CompetitionCard/CompetitionCard';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import './HomePage.css'; 
import '../../styles/common.css'
const HomePage: React.FC = () => {
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

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
                <h1>Список соревнований</h1>
            </div>
            <button
                onClick={handleCreateCompetition}
                className="btn add"
                aria-label="Создать новое соревнование"
            >
                <span className="button-icon">+</span>
                Новое соревнование
            </button>
            <p></p>
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