import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import './StudiesModal.css';

const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const YEARS = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() + 5 - i);
const MAX_DESCRIPTION_LENGTH = 1000;

export default function StudiesModal({
    isOpen,
    onClose,
    onSave,
    initialData = null,
}) {
    const [formData, setFormData] = useState({
        institution: '',
        degree: '',
        skills: [],
        start_date: { month: '', year: '' },
        end_date: { month: '', year: '' },
        description: '',
    });

    const [skillInput, setSkillInput] = useState('');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    institution: initialData.institution || '',
                    degree: initialData.degree || '',
                    skills: initialData.skills || [],
                    start_date: initialData.start_date || { month: '', year: '' },
                    end_date: initialData.end_date || { month: '', year: '' },
                    description: initialData.description || '',
                });
            } else {
                // Reset form for new entry
                setFormData({
                    institution: '',
                    degree: '',
                    skills: [],
                    start_date: { month: '', year: '' },
                    end_date: { month: '', year: '' },
                    description: '',
                });
            }
            setSkillInput('');
            setErrors({});
        }
    }, [isOpen, initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleDateChange = (type, field, value) => {
        setFormData(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [field]: value
            }
        }));
    };

    const handleAddSkill = () => {
        if (skillInput.trim() && formData.skills.length < 3) {
            setFormData(prev => ({
                ...prev,
                skills: [...prev.skills, skillInput.trim()]
            }));
            setSkillInput('');
        }
    };

    const handleRemoveSkill = (indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter((_, index) => index !== indexToRemove)
        }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.institution.trim()) {
            newErrors.institution = 'La institución educativa es obligatoria';
        }
        if (!formData.degree.trim()) {
            newErrors.degree = 'El título es obligatorio';
        }
        // Validate that end date is not before start date
        if (
            formData.start_date.year && formData.end_date.year
        ) {
            const startYear = parseInt(formData.start_date.year, 10);
            const endYear = parseInt(formData.end_date.year, 10);
            if (endYear < startYear) {
                newErrors.end_date = 'La fecha de finalización debe ser posterior a la fecha de inicio';
            } else if (endYear === startYear) {
                if (formData.start_date.month && formData.end_date.month) {
                    const startMonthIdx = MONTHS.indexOf(formData.start_date.month);
                    const endMonthIdx = MONTHS.indexOf(formData.end_date.month);
                    if (endMonthIdx < startMonthIdx) {
                        newErrors.end_date = 'La fecha de finalización debe ser posterior a la fecha de inicio';
                    }
                }
            }
        }
        return newErrors;
    };

    const handleSubmit = () => {
        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const studyToSave = {
            institution: formData.institution,
            degree: formData.degree,
            skills: formData.skills,
            start_date: formData.start_date,
            end_date: formData.end_date,
            description: formData.description,
        };

        onSave(studyToSave);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? "Editar educación" : "Añadir educación"}
            size="large"
        >
            <div className="studies-modal-content">
                <div className="full-width">
                    <Input
                        label="Institución educativa *"
                        name="institution"
                        value={formData.institution}
                        onChange={handleChange}
                        placeholder="P. ej. Berklee College of Music"
                        error={errors.institution}
                    />
                </div>

                <div className="full-width">
                    <Input
                        label="Título *"
                        name="degree"
                        value={formData.degree}
                        onChange={handleChange}
                        placeholder="P. ej. Grado en Música Moderna"
                        error={errors.degree}
                    />
                </div>

                <div className="form-row two-cols dates-container">
                    <div className="date-group">
                        <label>Fecha de inicio</label>
                        <div className="date-inputs">
                            <select
                                value={formData.start_date.month}
                                onChange={(e) => handleDateChange('start_date', 'month', e.target.value)}
                                className="select-input"
                            >
                                <option value="">Mes</option>
                                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                            <select
                                value={formData.start_date.year}
                                onChange={(e) => handleDateChange('start_date', 'year', e.target.value)}
                                className="select-input"
                            >
                                <option value="">Año</option>
                                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="date-group">
                        <label>Fecha de finalización</label>
                        <div className="date-inputs">
                            <select
                                value={formData.end_date.month}
                                onChange={(e) => handleDateChange('end_date', 'month', e.target.value)}
                                className="select-input"
                            >
                                <option value="">Mes</option>
                                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                            <select
                                value={formData.end_date.year}
                                onChange={(e) => handleDateChange('end_date', 'year', e.target.value)}
                                className="select-input"
                            >
                                <option value="">Año</option>
                                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="form-group full-width">
                    <div className="section-header-small">
                        <label>Aptitudes adquiridas</label>
                        <span className="count-label">{formData.skills.length}/3</span>
                    </div>

                    <div className="tag-input-row">
                        <div className="input-wrapper">
                            <Input
                                value={skillInput}
                                onChange={(e) => setSkillInput(e.target.value)}
                                placeholder="Ej: Piano, Producción, Canto..."
                                disabled={formData.skills.length >= 3}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddSkill();
                                    }
                                }}
                            />
                        </div>
                        <Button
                            type="button"
                            onClick={handleAddSkill}
                            disabled={!skillInput.trim() || formData.skills.length >= 3}
                            variant="secondary"
                        >
                            +
                        </Button>
                    </div>

                    <div className="tags-list">
                        {formData.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="tag-badge">
                                {skill}
                                <button
                                    type="button"
                                    className="tag-remove"
                                    onClick={() => handleRemoveSkill(index)}
                                    aria-label="Eliminar aptitud"
                                >
                                    ×
                                </button>
                            </Badge>
                        ))}
                    </div>
                </div>

                <div className="form-group full-width">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <label style={{ marginBottom: 0 }}>Descripción</label>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{formData.description.length}/{MAX_DESCRIPTION_LENGTH}</span>
                    </div>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={5}
                        className="textarea-input"
                        placeholder="Describe lo que hiciste en este periodo, aprendizajes, logros, etc."
                        maxLength={MAX_DESCRIPTION_LENGTH}
                    />
                </div>

                <div className="modal-actions">
                    <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button variant="primary" onClick={handleSubmit}>Guardar</Button>
                </div>
            </div>
        </Modal>
    );
}
