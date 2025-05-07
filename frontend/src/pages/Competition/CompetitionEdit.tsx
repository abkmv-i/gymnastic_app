import React, {useEffect, useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import axios from 'axios';
import {Competition, Gymnast, AgeCategory, Stream, ExtendedStream} from '../../models/types';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import Tabs from '../../components/Common/Tabs';
import CompetitionForm from '../../components/Competition/CompetitionForm';
import GymnastsTable from '../../components/Gymnast/GymnastsTable';
import AgeCategoriesManager from '../../components/AgeCategoriesManager/AgeCategoriesManager';
import EditStreamsTable from '../../components/Streams/EditStreamsTable';
import JudgesTable from '../../components/Judges/JudgesTable';
import { Judge } from '../../models/types';
import { useAuth } from '../../context/AuthContext';

import '../../styles/common.css';
import '../../App.css';

const CompetitionEdit: React.FC = () => {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [competition, setCompetition] = useState<Competition | null>(null);
    const [gymnasts, setGymnasts] = useState<Gymnast[]>([]);
    const [ageCategories, setAgeCategories] = useState<AgeCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('details');
    const [streams, setStreams] = useState<ExtendedStream[]>([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [judges, setJudges] = useState<Judge[]>([]);
    const { user } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [compRes, gymnastsRes, categoriesRes, streamsRes, judgesRes] = await Promise.all([
                    axios.get<Competition>(`http://localhost:8080/competitions/${id}`),
                    axios.get<Gymnast[]>(`http://localhost:8080/competitions/${id}/gymnasts`),
                    axios.get<AgeCategory[]>(`http://localhost:8080/competitions/${id}/age-categories`),
                    axios.get<Stream[]>(`http://localhost:8080/competitions/${id}/streams-with-gymnasts`),
                    axios.get<Judge[]>(`http://localhost:8080/judges/competition/${id}`)
                ]);

                setCompetition(compRes.data);
                setGymnasts(gymnastsRes.data);
                setAgeCategories(categoriesRes.data);
                setStreams(streamsRes.data);
                setJudges(judgesRes.data);

            } catch (err) {
                setError('Не удалось загрузить данные соревнования');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        fetchIsAdmin();

    }, [id]);

    const fetchIsAdmin = async () => {
        try {
          const res = await axios.get<boolean>(`http://localhost:8080/competitions/${id}/is-admin`);
          setIsAdmin(res.data);
        } catch {
          console.error("Не удалось проверить права администратора");
        }
      };


    const fetchStreams = () => {
        axios.get<ExtendedStream[]>(`http://localhost:8080/competitions/${id}/streams-with-gymnasts`)
            .then(res => setStreams(res.data))
            .catch(err => console.error(err));
    };

    const fetchJudges = async () => {
        try {
          const res = await axios.get<Judge[]>(`http://localhost:8080/judges/competition/${id}`);
          setJudges(res.data);
        } catch {
          console.error("Не удалось загрузить судей");
        }
      };
      
      
    const handleSubmit = async (competitionData: Omit<Competition, 'id' | 'created_at'>) => {
        try {
            await axios.put(`http://localhost:8080/competitions/${id}`, competitionData);
            navigate(`/competitions/${id}`);
        } catch (err) {
            setError('Не удалось обновить соревнование');
        }
    };
    const handleDeleteCompetition = async () => {
        try {
            await axios.delete(`http://localhost:8080/competitions/${id}`);
            navigate('/'); // возвращение на список
        } catch (err) {
            setError('Не удалось удалить соревнование');
        }
    };
    if (loading) return <LoadingSpinner/>;
    if (!competition) return <div>Соревнование не найдено</div>;
    if (!isAdmin) return <div className="error-message">У вас нет прав для редактирования этого соревнования</div>;


    return (
        <div className="container">
            <div className="competition-header">

                <h1>Редактирование соревнования</h1>
                <div className="competition-meta">
                    <span>Дата: {new Date(competition.date).toLocaleDateString()}</span>
                    <span>Место: {competition.location}</span>
                    <span>Статус: {competition.status}</span>
                </div>
                <p></p>
                <button
                    onClick={() => navigate(`/competitions/${id}`)}
                    className="btn"
                >
                    ← Назад к соревнованию
                </button>
                <button
                    className="btn delete"
                    onClick={() => setShowDeleteModal(true)}
                >
                    🗑 Удалить соревнование
                </button>
            </div>


            {error && <div className="error-message">{error}</div>}

            <Tabs
                tabs={[
                    {id: 'details', label: 'Основная информация'},
                    {id: 'gymnasts', label: 'Гимнастки'},
                    {id: 'categories', label: 'Возрастные категории'},
                    {id: 'streams', label: 'Расписание'},
                    { id: 'judges', label: 'Судьи' }, 
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

                            axios.delete(`http://localhost:8080/gymnasts/${gymnastId}`)
                                .then(() => {
                                    setGymnasts(gymnasts.filter(g => g.id !== gymnastId));
                                });
                        }
                        }
                    />
                )}

                {activeTab === 'categories' && (
                    <AgeCategoriesManager
                        ageCategories={ageCategories}
                        setAgeCategories={setAgeCategories}
                        competitionId={competition.id}
                    />
                )}
                {activeTab === 'streams' && (
                    <EditStreamsTable
                        streams={streams}
                        ageCategories={ageCategories}
                        competitionId={competition.id}
                        onRefresh={fetchStreams}
                    />
                )}
                {activeTab === 'judges' && (
                    <JudgesTable
                        judges={judges}
                        competitionId={competition.id}
                        onUpdate={fetchJudges}
                    />
                    )}


            </div>
            {showDeleteModal && (
                <div className="modal-backdrop">
                    <div className="modal">
                        <h2>Вы уверены, что хотите удалить соревнование?</h2>
                        <div className="modal-buttons">
                            <button className="cancel" onClick={() => setShowDeleteModal(false)}>Отмена</button>
                            <button className="confirm" onClick={handleDeleteCompetition}>Удалить</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default CompetitionEdit;