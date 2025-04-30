import React, {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import axios from 'axios';
import {Stream} from '../models/types';
import LoadingSpinner from '../components/LoadingSpinner';
import './StreamsPage.css';

const StreamsPage: React.FC = () => {
    const {competitionId} = useParams<{ competitionId: string }>();
    const [streams, setStreams] = useState<Stream[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStreams = async () => {
            try {
                const response = await axios.get<Stream[]>(`/competitions/${competitionId}/streams`);
                setStreams(response.data);
            } catch (err) {
                setError('Failed to fetch streams');
            } finally {
                setLoading(false);
            }
        };

        fetchStreams();
    }, [competitionId]);

    const handleAddStream = () => {
        navigate(`/competitions/${competitionId}/streams/new`);
    };

    if (loading) return <LoadingSpinner/>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="streams-page">
            <div className="header">
                <h1>Competition Streams</h1>
                <button onClick={handleAddStream}>Add Stream</button>
            </div>

            <table>
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Scheduled Start</th>
                    <th>Age Category</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {streams.map(stream => (
                    <tr key={stream.id}>
                        <td>{stream.name}</td>
                        <td>{new Date(stream.scheduled_start).toLocaleString()}</td>
                        <td>{stream.age_category_id}</td>
                        <td>
                            <button onClick={() => navigate(`/streams/${stream.id}`)}>
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

export default StreamsPage;