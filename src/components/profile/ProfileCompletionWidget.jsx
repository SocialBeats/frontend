import { useState } from 'react';
import { useProfileCompletion } from '@/hooks/use-profile-completion';
import './ProfileCompletionWidget.css';

// Restricciones de validación por paso
const STEP_REQUIREMENTS = {
  basic_info: 'Nombre (mín. 2 caracteres), ciudad y país',
  about_me: 'Mínimo 50 caracteres',
  avatar: 'Sube una foto de perfil',
  contact: 'Teléfono o sitio web',
  skills: 'Mínimo 3 aptitudes',
  education: 'Al menos 1 estudio',
  certifications: 'Al menos 1 certificación',
  identity: 'Verificación de identidad',
};

/**
 * Widget de completitud de perfil en modo wizard (1 paso a la vez)
 */
export default function ProfileCompletionWidget({
  onEditBasic,
  onEditAbout,
  onEditTags,
}) {
  const { completionPercentage, verificationLevel, steps, loading, error, refetch } =
    useProfileCompletion();
  const [expanded, setExpanded] = useState(false);
  const [showIdentityInfo, setShowIdentityInfo] = useState(false);
  const [skippedSteps, setSkippedSteps] = useState([]);

  if (loading) {
    return (
      <div className="profile-completion-widget loading">
        <div className="widget-spinner"></div>
      </div>
    );
  }

  if (error) {
    return null;
  }

  // Si ya está verificado (identityVerified = true), mostrar badge permanente
  
  if (verificationLevel === 'verified') {
    return (
      <div className="profile-completion-widget verified">
        <div className="verified-badge">
          <span className="verified-icon">✓</span>
          <span className="verified-text">Perfil Verificado</span>
        </div>
      </div>
    );
  }

  // Encontrar el paso actual (primer paso incompleto y no saltado)
  const currentStep = steps.find((s) => !s.completed && !skippedSteps.includes(s.id));

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep?.id);
  const completedCount = steps.filter((s) => s.completed).length;
  const skippedCount = skippedSteps.length;

  // Scroll a una sección específica
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Manejador de click en el paso actual
  const handleStepAction = () => {
    if (!currentStep) return;

    // Colapsar el widget al iniciar edición
    setExpanded(false);

    switch (currentStep.name) {
      case 'basic_info':
      case 'contact':
        onEditBasic?.();
        break;
      case 'about_me':
        onEditAbout?.();
        break;
      case 'avatar':
        // Avatar se edita haciendo click directamente en él
        break;
      case 'skills':
        onEditTags?.();
        scrollToSection('profile-skills-section');
        break;
      case 'education':
        scrollToSection('profile-studies-section');
        break;
      case 'certifications':
        scrollToSection('profile-hero');
        break;
      case 'identity':
        setShowIdentityInfo(true);
        break;
      default:
        break;
    }
  };

  const handleSkip = () => {
    if (currentStep && !currentStep.required) {
      // Añadir el paso actual a la lista de saltados
      setSkippedSteps((prev) => [...prev, currentStep.id]);
    }
  };

  return (
    <>
      <div className="profile-completion-widget wizard-mode">
        <div className="widget-header" onClick={() => setExpanded(!expanded)}>
          <div className="progress-circle">
            <svg viewBox="0 0 36 36" className="circular-chart">
              <path
                className="circle-bg"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="circle"
                strokeDasharray={`${completionPercentage}, 100`}
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <text x="18" y="20.35" className="percentage">
                {completionPercentage}%
              </text>
            </svg>
          </div>
          <div className="widget-info">
            <h4>Completa tu perfil</h4>
            <p className="status-text">
              {completedCount} de {steps.length} pasos completados
            </p>
          </div>
          <span className={`expand-icon ${expanded ? 'expanded' : ''}`}>▼</span>
        </div>

        {expanded && currentStep && (
          <div className="wizard-content">
            {/* Indicador de pasos */}
            <div className="step-indicator">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`step-dot ${step.completed ? 'completed' : ''} ${
                    step.id === currentStep.id ? 'current' : ''
                  }`}
                  title={step.label}
                />
              ))}
            </div>

            {/* Paso actual */}
            <div className="current-step">
              <div className="step-header">
                <span className="step-number">Paso {currentStepIndex + 1}</span>
                {!currentStep.required && (
                  <span className="optional-tag">Opcional</span>
                )}
              </div>
              <h3 className="step-title">{currentStep.label}</h3>
              <p className="step-requirement">
                {STEP_REQUIREMENTS[currentStep.name]}
              </p>
            </div>

            {/* Botones de acción */}
            <div className="wizard-actions">
              {!currentStep.required && (
                <button className="skip-btn" onClick={handleSkip}>
                  Saltar paso
                </button>
              )}
              <button className="action-btn" onClick={handleStepAction}>
                {currentStep.name === 'identity' ? 'Ver información' : 'Completar'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de información de verificación de identidad */}
      {showIdentityInfo && (
        <div className="identity-info-modal-overlay" onClick={() => setShowIdentityInfo(false)}>
          <div className="identity-info-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowIdentityInfo(false)}>×</button>
            <div className="persona-mock">
              <div className="persona-icon">🔐</div>
              <h3>Verificación de Identidad</h3>
              <p>
                Para obtener el badge de "Perfil Verificado", necesitas completar
                una verificación de identidad con nuestro socio Persona.
              </p>
              <div className="persona-info">
                <h4>¿Qué necesitarás?</h4>
                <ul>
                  <li>📄 Documento de identidad (DNI, Pasaporte o Carnet de conducir)</li>
                  <li>📸 Una foto selfie para verificación facial</li>
                  <li>⏱️ Aproximadamente 5 minutos</li>
                </ul>
              </div>
              <button className="persona-btn" disabled>
                Iniciar verificación (Próximamente)
              </button>
              <p className="persona-disclaimer">
                Tus datos serán procesados de forma segura por Persona Inc.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
