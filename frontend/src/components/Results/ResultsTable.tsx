import React, {useState} from 'react';
import {Result, Gymnast, AgeCategory} from '../../models/types';
import './ResultsTable.css';

interface ExtendedResult extends Result {
    gymnast?: Gymnast;
    age_category_id?: number;
    age_category_name?: string;
    apparatusResults?: {
        apparatus: string;
        a_score: number;
        e_score: number;
        da_score: number;
        db_score: number;
        total: number;
    }[];
}

const ResultsTable: React.FC<{
    results: ExtendedResult[];
    gymnasts: Gymnast[];
    ageCategories: AgeCategory[];
}> = ({results, gymnasts, ageCategories}) => {
    const [expandedCategories, setExpandedCategories] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Группировка результатов по возрастным категориям
    const resultsByCategory = ageCategories.map((category: AgeCategory) => {
        const categoryResults = results
            .filter(result => result.age_category_id === category.id)
            .map(result => ({
                ...result,
                gymnast: gymnasts.find(g => g.id === result.gymnast_id),
                age_category_name: category.name
            }))
            .sort((a, b) => (a.rank || 0) - (b.rank || 0));

        return {
            category,
            results: categoryResults
        };
    });

    const toggleCategory = (categoryId: number) => {
        setExpandedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const toggleAllCategories = () => {
        if (expandedCategories.length === ageCategories.length) {
            // Если все раскрыты - сворачиваем все
            setExpandedCategories([]);
        } else {
            // Иначе раскрываем все
            setExpandedCategories(ageCategories.map(c => c.id));
        }
    };

    const translateApparatus = (apparatus: string) => {
        const translations: Record<string, string> = {
            'hoop': 'Обруч',
            'ball': 'Мяч',
            'clubs': 'Булавы',
            'ribbon': 'Лента',
            'rope': 'Скакалка',
            'no_apparatus': 'Б/П'
        };
        return translations[apparatus.toLowerCase()] || apparatus;
    };

    const formatScore = (score?: number | string) => {
        if (score === undefined || score === null) return '-';
        const num = typeof score === 'string' ? parseFloat(score) : score;
        return isNaN(num) ? '-' : num.toFixed(2);
    };

    // Автоматически раскрываем категорию, если есть поисковый запрос
    React.useEffect(() => {
        if (searchTerm.trim()) {
            const matchedCategories = resultsByCategory
                .filter(({results}) =>
                    results.some(result => {
                        const gymnast = result.gymnast;
                        return (
                            gymnast?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            gymnast?.city?.toLowerCase().includes(searchTerm.toLowerCase())
                        );
                    })
                )
                .map(({category}) => category.id);

            setExpandedCategories(prev => Array.from(new Set([...prev, ...matchedCategories])));
        }
    }, [searchTerm, resultsByCategory]);

    return (
        <div className="results-container">
            <div className="results-search">
                <input
                    type="text"
                    placeholder="Поиск по имени гимнастки или городу"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                <button
                    onClick={toggleAllCategories}
                    className="toggle-all-button"
                >
                    {expandedCategories.length === ageCategories.length ?
                        'Свернуть все' : 'Раскрыть все'}
                </button>
            </div>

            {resultsByCategory.map(({category, results}) => {
                const hasMatchingResults = results.some(result => {
                    const gymnast = result.gymnast;
                    return (
                        gymnast?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        gymnast?.city?.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                });

                return (
                    <div
                        key={category.id}
                        className={`category-group ${hasMatchingResults ? 'has-match' : ''}`}
                    >
                        <div
                            className="category-header"
                            onClick={() => toggleCategory(category.id)}
                        >
                            <h3>
                                {category.name} ({results.length})
                                {results.length > 0 && (
                                    <span className="best-score">
                    Лучший результат: {formatScore(results[0].total_score)}
                  </span>
                                )}
                            </h3>
                            <span className="toggle-icon">
                {expandedCategories.includes(category.id) ? '−' : '+'}
              </span>
                        </div>

                        {expandedCategories.includes(category.id) && (
                            <div className="category-results">
                                {results.length === 0 ? (
                                    <div className="no-results">Нет результатов в этой категории</div>
                                ) : (
                                    results
                                        .filter(result => {
                                            const gymnast = result.gymnast;
                                            return (
                                                !searchTerm.trim() ||
                                                gymnast?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                gymnast?.city?.toLowerCase().includes(searchTerm.toLowerCase())
                                            );
                                        })
                                        .map(result => {
                                            const gymnast = result.gymnast;
                                            const isMatch = searchTerm.trim() && (
                                                gymnast?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                gymnast?.city?.toLowerCase().includes(searchTerm.toLowerCase())
                                            );

                                            return (
                                                <div
                                                    key={result.id}
                                                    id={`gymnast-${result.id}`}
                                                    className={`gymnast-result ${isMatch ? 'matched' : ''}`}
                                                >
                                                    <div className="gymnast-summary">
                                                        <span className="rank">{result.rank}</span>
                                                        <span className="name">
                              {gymnast?.name || 'Unknown'}
                                                            {gymnast?.city &&
                                                                <span className="city">{gymnast.city}</span>}
                            </span>
                                                        <span className="total">{formatScore(result.total_score)}</span>
                                                    </div>

                                                    {result.apparatusResults && result.apparatusResults.length > 0 && (
                                                        <table className="apparatus-results">
                                                            <thead>
                                                            <tr>
                                                                <th>Предмет</th>
                                                                <th>Всего</th>
                                                                <th>A</th>
                                                                <th>E</th>
                                                                <th>DA</th>
                                                                <th>DB</th>
                                                            </tr>
                                                            </thead>
                                                            <tbody>
                                                            {result.apparatusResults.map((apparatusResult, idx) => (
                                                                <tr key={idx}>
                                                                    <td>{translateApparatus(apparatusResult.apparatus)}</td>
                                                                    <td>{formatScore(apparatusResult.total)}</td>
                                                                    <td>{formatScore(apparatusResult.a_score)}</td>
                                                                    <td>{formatScore(apparatusResult.e_score)}</td>
                                                                    <td>{formatScore(apparatusResult.da_score)}</td>
                                                                    <td>{formatScore(apparatusResult.db_score)}</td>
                                                                </tr>
                                                            ))}
                                                            </tbody>
                                                        </table>
                                                    )}
                                                </div>
                                            );
                                        })
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default ResultsTable;