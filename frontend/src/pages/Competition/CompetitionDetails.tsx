import React, {useEffect, useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import axios from 'axios';
import {Competition, Gymnast, Stream, Result, AgeCategory} from '../../models/types';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import Tabs from '../../components/Common/Tabs';
import StreamsTable from '../../components/Streams/StreamsTable';
import ResultsTable from '../../components/Results/ResultsTable';
import '../../styles/common.css';

const CompetitionDetails: React.FC = () => {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [competition, setCompetition] = useState<Competition | null>(null);
    const [gymnasts, setGymnasts] = useState<Gymnast[]>([]);
    const [streams, setStreams] = useState<Stream[]>([]);
    const [results, setResults] = useState<Result[]>([]);
    const [ageCategories, setAgeCategories] = useState<AgeCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('streams');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [
                    compRes,
                    gymnastsRes,
                    streamsRes,
                    resultsRes,
                    ageCategoriesRes
                ] = await Promise.all([
                    axios.get<Competition>(`http://localhost:8080/competitions/${id}`),
                    axios.get<Gymnast[]>(`http://localhost:8080/competitions/${id}/gymnasts`),
                    axios.get<Stream[]>(`http://localhost:8080/competitions/${id}/streams-with-gymnasts`),
                    axios.get<Result[]>(`http://localhost:8080/competitions/${id}/results-with-details`),
                    axios.get<AgeCategory[]>(`http://localhost:8080/competitions/${id}/age-categories`)
                ]);

                setCompetition(compRes.data);
                setGymnasts(gymnastsRes.data);
                setStreams(streamsRes.data);
                setResults(resultsRes.data);
                setAgeCategories(ageCategoriesRes.data);
            } catch (err) {
                console.error('Ошибка при загрузке данных соревнования:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleEdit = () => {
        navigate(`/competitions/${id}/edit`);
    };

    const handleJudge = () => {
        navigate(`/competitions/${id}/judge`);
    };

    if (loading) return <LoadingSpinner/>;
    if (!competition) return <div>Соревнование не найдено</div>;

    return (
        <div className="section-container">
            <div className="competition-header">

                <h1>{competition.name}</h1>
                <div className="competition-meta">
                    <span>Дата: {new Date(competition.date).toLocaleDateString()}</span>
                    <span>Место проведения: {competition.location}</span>
                    <span>Статус: {competition.status === 'planned' ? 'Запланировано' : competition.status === 'in_progress' ? 'В процессе' : 'Завершено'}</span>
                </div>

                <div className="action-buttons">
                    <button onClick={handleEdit} className="btn edit">
                        Редактировать
                    </button>
                    <button onClick={handleJudge} className="btn add">
                        Судить
                    </button>
                </div>
            </div>

            <Tabs
                tabs={[
                    {id: 'streams', label: 'Расписание'},
                    {id: 'results', label: 'Результаты'},
                ]}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            <div className="table-container">
                {activeTab === 'streams' && (
                    <StreamsTable
                        streams={streams}
                        ageCategories={ageCategories}
                    />
                )}
                {activeTab === 'results' && (
                    <ResultsTable
                        results={results}
                        gymnasts={gymnasts}
                        ageCategories={ageCategories}
                    />
                )}
            </div>
        </div>
    );
};

export default CompetitionDetails;
