// CompetitionJudging.tsx (страница судейства)
import React, {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import axios from 'axios';
import {Gymnast, Performance, Score} from '../../models/types';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import JudgingForm from '../../components/Judges/JudgingForm';
import {useAuth} from '../../context/AuthContext';

const CompetitionJudging: React.FC = () => {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [gymnasts, setGymnasts] = useState<Gymnast[]>([]);
    const [performances, setPerformances] = useState<Performance[]>([]);
    const [selectedGymnast, setSelectedGymnast] = useState<string>('');
    const [selectedPerformance, setSelectedPerformance] = useState<Performance | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const {user} = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [gymnastsRes, performancesRes] = await Promise.all([
                    axios.get<Gymnast[]>(`http://localhost:8080/competitions/${id}/gymnasts`),
                    axios.get<Performance[]>(`http://localhost:8080/competitions/${id}/performances`),
                ]);

                setGymnasts(gymnastsRes.data);
                setPerformances(performancesRes.data);
            } catch (err) {
                setError('Failed to fetch data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleGymnastChange = (gymnastId: string) => {
        setSelectedGymnast(gymnastId);
        const performance = performances.find(p => p.gymnast_id === parseInt(gymnastId));
        setSelectedPerformance(performance || null);
    };

    const handleSubmitScore = async (scoreData: Omit<Score, 'id' | 'created_at'>) => {
        try {
            await axios.post('http://localhost:8080/scores/judge', scoreData);
            navigate(`/competitions/${id}/results`);
        } catch (err) {
            setError('Failed to submit score');
        }
    };

    if (loading) return <LoadingSpinner/>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="container">
            <h1>Judging Panel</h1>

            <div className="judging-container">
                <div className="gymnast-selector">
                    <label htmlFor="gymnast">Select Gymnast:</label>
                    <select
                        id="gymnast"
                        value={selectedGymnast}
                        onChange={(e) => handleGymnastChange(e.target.value)}
                    >
                        <option value="">-- Select Gymnast --</option>
                        {gymnasts.map(gymnast => (
                            <option key={gymnast.id} value={gymnast.id}>
                                {gymnast.name} ({gymnast.birth_year})
                            </option>
                        ))}
                    </select>
                </div>

                {selectedPerformance && (
                    <JudgingForm
                        performance={selectedPerformance}
                        judgeId={user?.id || 0}
                        onSubmit={handleSubmitScore}
                    />
                )}
            </div>
        </div>
    );
};

export default CompetitionJudging;