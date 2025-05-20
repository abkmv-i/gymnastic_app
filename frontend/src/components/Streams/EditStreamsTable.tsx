import React, {useState} from 'react';
import axios from 'axios';
import {AgeCategory, ExtendedStream} from '../../models/types';
import './StreamsTable.css';
import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const EditStreamsTable: React.FC<{
    streams: ExtendedStream[];
    ageCategories: AgeCategory[];
    competitionId: number;
    onRefresh: () => void;
}> = ({streams, ageCategories, competitionId, onRefresh}) => {
    const [expandedStreams, setExpandedStreams] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [day_start_time, setDayStartTime] = useState('');
    const [day_end_time, setDayEndTime] = useState('');

    const getAgeCategoryName = (id?: number) => {
        if (!id) return 'Не указана';
        const category = ageCategories.find(c => c.id === id);
        return category ? category.name : 'Неизвестная категория';
    };

    const toggleStream = (streamId: number) => {
        setExpandedStreams(prev =>
            prev.includes(streamId)
                ? prev.filter(id => id !== streamId)
                : [...prev, streamId]
        );
    };

    const toggleAllStreams = () => {
        setExpandedStreams(expandedStreams.length === streams.length ? [] : streams.map(s => s.id));
    };

    const translateApparatus = (apparatus: string) => {
        const translations: Record<string, string> = {
            'hoop': 'Обруч',
            'ball': 'Мяч',
            'clubs': 'Булавы',
            'ribbon': 'Лента',
            'rope': 'Скакалка'
        };
        return translations[apparatus.toLowerCase()] || apparatus;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleAutoDistribute = () => {
        if (!day_start_time || !day_end_time) {
            toast.error("Пожалуйста, укажите время начала и окончания дня соревнований");
            return;
        }

        axios.post(`http://localhost:8080/competitions/${competitionId}/auto-assign`, {
            day_start_time,
            day_end_time
        })
            .then(() => {
                toast.success("Гимнастки успешно распределены по потокам");
                onRefresh();
            })
            .catch(err => {
                toast.error(err.response?.data?.error || "Ошибка при автоматическом распределении");
            });
    };

    const handleManualAssign = (gymnastId: number, newStreamId: number) => {
        axios.post(`http://localhost:8080/competitions/streams/assign-gymnast`, {
            gymnast_id: gymnastId,
            stream_id: newStreamId,
            competition_id: competitionId  // <-- добавлено
        })
            .then(() => {
                toast.success("Гимнастка перемещена");
                onRefresh(); // обновить данные
            })
            .catch(err => {
                toast.error(err.response?.data?.error || "Ошибка при перемещении гимнастки");
            });
    };

    React.useEffect(() => {
        if (searchTerm.trim()) {
            const matchedStreams = streams
                .filter((stream) =>
                    stream.gymnasts?.some(gymnast =>
                        gymnast.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        gymnast.city?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                )
                .map(stream => stream.id);

            setExpandedStreams(prev => Array.from(new Set([...prev, ...matchedStreams])));
        }
    }, [searchTerm, streams]);

    return (
        <div className="streams-container">
            <div className="streams-search">
                    <input
                        type="text"
                        placeholder="Поиск по имени гимнастки или городу"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <button onClick={toggleAllStreams} className="toggle-all-button">
                        {expandedStreams.length === streams.length ? 'Свернуть все' : 'Раскрыть все'}
                    </button>
            </div>
            <div className="streams-search">
                <div className="time-and-autoassign">
                    <div className="time-inputs">
                        <input
                            type="time"
                            value={day_start_time}
                            onChange={(e) => setDayStartTime(e.target.value)}
                            className="form-input"
                        />
                        <input
                            type="time"
                            value={day_end_time}
                            onChange={(e) => setDayEndTime(e.target.value)}
                            className="form-input"
                        />
                        <button onClick={handleAutoDistribute} className="btn add">
                            Авто-распределение
                        </button>
                    </div>
                </div>
            </div>


            <div className="streams-accordion">
                {streams.map((stream) => {
                    const hasMatchingGymnasts = stream.gymnasts?.some(gymnast =>
                        gymnast.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        gymnast.city?.toLowerCase().includes(searchTerm.toLowerCase())
                    );

                    return (
                        <div key={stream.id} className={`stream-item ${hasMatchingGymnasts ? 'has-match' : ''}`}>
                            <div className="stream-header" onClick={() => toggleStream(stream.id)}>
                                <div className="stream-info">
                                    <span className="stream-number">Поток №{stream.stream_number}</span>
                                    <span
                                        className="stream-category">Категория: {getAgeCategoryName(stream.age_category_id)}</span>
                                    <span
                                        className="stream-time">Начало: {formatDate(stream.scheduled_start.toString())}</span>
                                    {stream.gymnasts?.length && (
                                        <span className="gymnast-count">Гимнасток: {stream.gymnasts.length}</span>
                                    )}
                                </div>
                                <div className="stream-toggle">
                                    {expandedStreams.includes(stream.id) ? '−' : '+'}
                                </div>
                            </div>

                            {expandedStreams.includes(stream.id) && (
                                <div className="stream-content">
                                    {stream.gymnasts?.length ? (
                                        <table className="gymnasts-table">
                                            <tbody>
                                            {stream.gymnasts
                                                .filter(gymnast =>
                                                    !searchTerm.trim() ||
                                                    gymnast.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                    gymnast.city?.toLowerCase().includes(searchTerm.toLowerCase())
                                                )
                                                .map((gymnast, index) => (
                                                    <tr key={gymnast.id}>
                                                        <td>{index + 1}</td>
                                                        <td>
                                                            <div>{gymnast.name}</div>
                                                            <div className="gymnast-details">
                                                                {gymnast.birth_year &&
                                                                    <span>Г.р.: {gymnast.birth_year}</span>}
                                                                {gymnast.city && <span>Город: {gymnast.city}</span>}
                                                                {gymnast.coach && <span>Тренер: {gymnast.coach}</span>}
                                                            </div>
                                                        </td>
                                                        <td>{gymnast.apparatuses[0] ? translateApparatus(gymnast.apparatuses[0]) : '-'}</td>
                                                        <td>{gymnast.apparatuses[1] ? translateApparatus(gymnast.apparatuses[1]) : '-'}</td>
                                                        <td>
                                                            <select
                                                                className="category"
                                                                value={stream.id}
                                                                onChange={(e) => handleManualAssign(gymnast.id, Number(e.target.value))}
                                                            >
                                                                {streams
                                                                    .filter(s => s.age_category_id === stream.age_category_id) // только потоки той же категории!
                                                                    .map(s => (
                                                                        <option key={s.id} value={s.id}>
                                                                            Поток №{s.stream_number}
                                                                        </option>
                                                                    ))}
                                                            </select>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div className="no-gymnasts">Нет гимнасток в этом потоке</div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <ToastContainer position="top-right" autoClose={3000}/>
        </div>
    );
};

export default EditStreamsTable;
