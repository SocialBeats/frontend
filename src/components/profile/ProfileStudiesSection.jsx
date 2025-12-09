import { useState } from 'react';
import StudiesModal from './StudiesModal';
import Badge from '@/components/ui/Badge';
import ConfirmModal from '@/components/ui/ConfirmModal';
import './ProfileStudiesSection.css';

const StudyItem = ({ study, index, isOwnProfile, onEdit, onDelete }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const MAX_LENGTH = 150;
    const description = study.description || '';
    const shouldTruncate = description.length > MAX_LENGTH;

    return (
        <div className="study-item">
            <div className="study-icon">
                <img
                    src={`https://ui-avatars.com/api/?name=${study.institution}&background=random&color=fff&size=48`}
                    alt={study.institution}
                />
            </div>
            <div className="study-content">
                <div className="study-header">
                    <h3 className="study-school">{study.degree}</h3>
                    {isOwnProfile && (
                        <div className="study-actions">
                            <button
                                type="button"
                                className="btn-icon-edit"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onEdit(study, index);
                                }}
                            >
                                ✎
                            </button>
                            <button
                                type="button"
                                className="btn-icon-delete"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onDelete(index);
                                }}
                            >
                                ✕
                            </button>
                        </div>
                    )}
                </div>
                <p className="study-degree">
                    {study.institution}
                </p>
                <p className="study-date">
                    {study.start_date?.month} {study.start_date?.year} - {study.end_date?.month} {study.end_date?.year}
                </p>
                {study.skills && study.skills.length > 0 && (
                    <div className="study-skills-badges">
                        {study.skills.map((skill, i) => (
                            <Badge key={i} variant="secondary" className="tag-badge">
                                {skill}
                            </Badge>
                        ))}
                    </div>
                )}
                {description && (
                    <div className="study-description-wrapper">
                        <p className="study-description">
                            {shouldTruncate && !isExpanded
                                ? `${description.slice(0, MAX_LENGTH)}...`
                                : description}
                        </p>
                        {shouldTruncate && (
                            <button
                                type="button"
                                className="btn-show-more"
                                onClick={() => setIsExpanded(!isExpanded)}
                            >
                                {isExpanded ? 'Ver menos' : 'Ver más'}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default function ProfileStudiesSection({
    studies = [],
    isOwnProfile,
    onUpdateStudies,
}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStudy, setEditingStudy] = useState(null);
    const [editingIndex, setEditingIndex] = useState(null);

    const [deleteConfirmation, setDeleteConfirmation] = useState({
        isOpen: false,
        index: null
    });

    const handleAddClick = () => {
        setEditingStudy(null);
        setEditingIndex(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (study, index) => {
        setEditingStudy(study);
        setEditingIndex(index);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (index) => {
        setDeleteConfirmation({
            isOpen: true,
            index
        });
    };

    const handleConfirmDelete = () => {
        if (deleteConfirmation.index !== null) {
            const newStudies = [...studies];
            newStudies.splice(deleteConfirmation.index, 1);
            onUpdateStudies(newStudies);
        }
        setDeleteConfirmation({ isOpen: false, index: null });
    };

    const handleSaveStudy = (studyData) => {
        const newStudies = [...studies];
        if (editingIndex !== null) {
            newStudies[editingIndex] = studyData;
        } else {
            newStudies.push(studyData);
        }
        onUpdateStudies(newStudies);
    };

    return (
        <div className="profile-section-block">
            <div className="section-header">
                <h2>Educación</h2>
                {isOwnProfile && (
                    <div className="section-actions">
                        <button
                            type="button"
                            className="btn-add-section"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleAddClick();
                            }}
                            aria-label="Añadir educación"
                        >
                            +
                        </button>
                    </div>
                )}
            </div>

            <div className="studies-list">
                {studies.length === 0 ? (
                    <p className="empty-text">No has añadido información sobre tus estudios.</p>
                ) : (
                    studies.map((study, index) => (
                        <StudyItem
                            key={index}
                            study={study}
                            index={index}
                            isOwnProfile={isOwnProfile}
                            onEdit={handleEditClick}
                            onDelete={handleDeleteClick}
                        />
                    ))
                )}
            </div>

            <StudiesModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveStudy}
                initialData={editingStudy}
            />

            <ConfirmModal
                isOpen={deleteConfirmation.isOpen}
                onClose={() => setDeleteConfirmation({ isOpen: false, index: null })}
                onConfirm={handleConfirmDelete}
                title="Eliminar estudio"
                message="¿Estás seguro de que quieres eliminar este estudio? Esta acción no se puede deshacer."
                confirmText="Eliminar"
                confirmVariant="danger"
            />
        </div>
    );
}
