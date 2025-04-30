import React, {useState} from 'react';
import {Stream, AgeCategory, Gymnast} from '../models/types';
import './StreamsTable.css';

interface ExtendedStream extends Stream {
    gymnasts?: (Gymnast & { apparatuses: string[] })[];
}

const StreamsTable: React.FC<{
    streams: ExtendedStream[];
    ageCategories: AgeCategory[];
}> = ({streams, ageCategories}) => {
    const [expandedStreams, setExpandedStreams] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

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
        if (expandedStreams.length === streams.length) {
            // Если все раскрыты - сворачиваем все
            setExpandedStreams([]);
        } else {
            // Иначе раскрываем все
            setExpandedStreams(streams.map(s => s.id));
        }
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

    // Автоматически раскрываем потоки с найденными гимнастками
    React.useEffect(() => {
        if (searchTerm.trim()) {
            const matchedStreams = streams
                .filter((stream: ExtendedStream) =>
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
                <button
                    onClick={toggleAllStreams}
                    className="toggle-all-button"
                >
                    {expandedStreams.length === streams.length ?
                        'Свернуть все' : 'Раскрыть все'}
                </button>
            </div>

            <div className="streams-accordion">
                {streams.map((stream: ExtendedStream) => {
                    const hasMatchingGymnasts = stream.gymnasts?.some(gymnast =>
                        gymnast.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        gymnast.city?.toLowerCase().includes(searchTerm.toLowerCase())
                    );

                    return (
                        <div
                            key={stream.id}
                            className={`stream-item ${hasMatchingGymnasts ? 'has-match' : ''}`}
                        >
                            <div
                                className="stream-header"
                                onClick={() => toggleStream(stream.id)}
                            >
                                <div className="stream-info">
                                    <span className="stream-number">Поток №{stream.stream_number}</span>
                                    <span className="stream-category">
                    Категория: {getAgeCategoryName(stream.age_category_id)}
                  </span>
                                    <span className="stream-time">
                    Начало: {formatDate(stream.scheduled_start.toString())}
                  </span>
                                    {stream.gymnasts?.length && (
                                        <span className="gymnast-count">
                      Гимнасток: {stream.gymnasts.length}
                    </span>
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
                                                    <tr
                                                        key={gymnast.id}
                                                        className={
                                                            searchTerm.trim() &&
                                                            (gymnast.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                                gymnast.city?.toLowerCase().includes(searchTerm.toLowerCase()))
                                                                ? 'matched-gymnast'
                                                                : ''
                                                        }
                                                    >
                                                        <td className="number">{index + 1}</td>
                                                        <td className="name">
                                                            <div className="gymnast-name">{gymnast.name}</div>
                                                            <div className="gymnast-details">
                                                                {gymnast.birth_year &&
                                                                    <span>Г.р.: {gymnast.birth_year}</span>}
                                                                {gymnast.city && <span>Город: {gymnast.city}</span>}
                                                                {gymnast.coach && <span>Тренер: {gymnast.coach}</span>}
                                                            </div>
                                                        </td>
                                                        <td className="apparatus">
                                                            {gymnast.apparatuses[0]
                                                                ? translateApparatus(gymnast.apparatuses[0])
                                                                : '-'}
                                                        </td>
                                                        <td className="apparatus">
                                                            {gymnast.apparatuses[1]
                                                                ? translateApparatus(gymnast.apparatuses[1])
                                                                : '-'}
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
        </div>
    );
};

export default StreamsTable;