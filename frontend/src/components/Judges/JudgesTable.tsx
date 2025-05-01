import React from 'react';
import {Judge} from '../../models/types';
import './JudgesTable.css';

interface JudgesTableProps {
    judges: Judge[];
    onEdit?: (judge: Judge) => void;
    onDelete?: (judgeId: number) => void;
}

const JudgesTable: React.FC<JudgesTableProps> = ({judges, onEdit, onDelete}) => {
    return (
        <table className="judges-table">
            <thead>
            <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Created At</th>
                {onEdit || onDelete ? <th>Actions</th> : null}
            </tr>
            </thead>
            <tbody>
            {judges.map(judge => (
                <tr key={judge.id}>
                    <td>{judge.id}</td>
                    <td>{judge.name}</td>
                    <td>{new Date(judge.created_at).toLocaleDateString()}</td>
                    {(onEdit || onDelete) && (
                        <td className="actions">
                            {onEdit && (
                                <button
                                    onClick={() => onEdit(judge)}
                                    className="btn-edit"
                                >
                                    Edit
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    onClick={() => onDelete(judge.id)}
                                    className="btn-delete"
                                >
                                    Delete
                                </button>
                            )}
                        </td>
                    )}
                </tr>
            ))}
            </tbody>
        </table>
    );
};

export default JudgesTable;