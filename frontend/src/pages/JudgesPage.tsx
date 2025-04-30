import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import {Judge} from '../models/types';
import LoadingSpinner from '../components/LoadingSpinner';
import './JudgesPage.css';

const JudgesPage: React.FC = () => {
    const [judges, setJudges] = useState<Judge[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchJudges = async () => {
            try {
                const response = await axios.get<Judge[]>('http://localhost:8080/judges');
                setJudges(response.data);
            } catch (err) {
                setError('Failed to fetch judges');
            } finally {
                setLoading(false);
            }
        };

        fetchJudges();
    }, []);

    const handleAddJudge = () => {
        navigate('/judges/new');
    };

    if (loading) return <LoadingSpinner/>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="judges-page">
            <div className="header">
                <h1>Judges</h1>
                <button onClick={handleAddJudge}>Add Judge</button>
            </div>

            <table>
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {judges.map(judge => (
                    <tr key={judge.id}>
                        <td>{judge.name}</td>
                        <td>
                            <button onClick={() => navigate(`/judges/${judge.id}`)}>
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

export default JudgesPage;