// CompetitionCreate.tsx (создание соревнования)
import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import CompetitionForm from '../components/CompetitionForm';
import {Competition} from '../models/types';

const CompetitionCreate: React.FC = () => {
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (competitionData: Omit<Competition, 'id' | 'created_at'>) => {
        try {
            const response = await axios.post<Competition>('http://localhost:8080/competitions', competitionData);
            navigate(`/competitions/${response.data.id}`);
        } catch (err) {
            setError('Failed to create competition');
        }
    };

    return (
        <div className="container">
            <div className="competition-header">
                <h1>Создание соревнования</h1>
            </div>
            {error && <div className="error-message">{error}</div>}
            <CompetitionForm onSubmit={handleSubmit}/>
        </div>
    );
};

export default CompetitionCreate;