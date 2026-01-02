import React, { useState, useEffect } from 'react';
import { updateSubscriptionPlan, completeUpgrade, getSubscriptionStatus } from '../services/paymentService';
import { getCurrentUserId, getCurrentUsername } from '../services/authService';
import { logger } from '../logger';
import './Pricing.css';

// Plan configuration - matches backend plans.config.js
const plans = [
  {
    name: 'FREE',
    displayName: 'Free',
    description: 'Perfecto para comenzar a explorar SocialBeats',
    price: 0,
    currency: '€',
    period: 'mes',
    icon: '🎵',
    popular: false,
    features: [
      { text: 'Escucha beats ilimitados', included: true },
      { text: 'Máximo 3 beats subidos', included: true },
      { text: 'Perfil básico de artista', included: true },
      { text: 'Estadísticas básicas', included: true },
      { text: 'Banner personalizado', included: false },
      { text: 'Cover de perfil', included: false },
      { text: 'Beats destacados', included: false },
    ],
  },
  {
    name: 'PRO',
    displayName: 'Pro',
    description: 'Para productores que quieren destacar',
    price: 9.99,
    currency: '€',
    period: 'mes',
    icon: '🚀',
    popular: true,
    features: [
      { text: 'Escucha beats ilimitados', included: true },
      { text: 'Máximo 25 beats subidos', included: true },
      { text: 'Perfil verificado de artista', included: true },
      { text: 'Estadísticas avanzadas', included: true },
      { text: 'Banner personalizado', included: true },
      { text: 'Cover de perfil', included: true },
      { text: 'Hasta 3 beats destacados', included: true },
    ],
  },
  {
    name: 'STUDIO',
    displayName: 'Studio',
    description: 'Todo lo que necesitas para dominar',
    price: 19.99,
    currency: '€',
    period: 'mes',
    icon: '👑',
    popular: false,
    features: [
      { text: 'Escucha beats ilimitados', included: true },
      { text: 'Beats ilimitados subidos', included: true },
      { text: 'Perfil verificado premium', included: true },
      { text: 'Estadísticas completas + insights', included: true },
      { text: 'Banner personalizado', included: true },
      { text: 'Cover de perfil', included: true },
      { text: 'Beats destacados ilimitados', included: true },
    ],
  }
];

const Pricing = () => {
  const [loading, setLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Verificar parámetros de URL (success/cancel de Stripe y setup)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const canceled = urlParams.get('canceled');
    const setup = urlParams.get('setup');
    const sessionId = urlParams.get('session_id');
    const upgradeTo = urlParams.get('upgrade_to');

    // Retorno de setup (después de añadir método de pago)
    if (setup === 'success' && sessionId) {
      logger.info('Setup completed, completing upgrade...');
      handleCompleteUpgrade(sessionId, upgradeTo);
      return;
    }

    if (setup === 'canceled') {
      setErrorMessage('Añadir método de pago cancelado. Puedes intentar de nuevo cuando quieras.');
      window.history.replaceState({}, '', '/pricing');
      return;
    }

    // Retorno de checkout (flujo antiguo, por si acaso)
    if (success === 'true') {
      setSuccessMessage('¡Suscripción creada exitosamente! Tu plan se activará en breve.');
      window.history.replaceState({}, '', '/pricing');
      loadSubscriptionStatus();
    }

    if (canceled === 'true') {
      setErrorMessage('Pago cancelado. Puedes intentar de nuevo cuando quieras.');
      window.history.replaceState({}, '', '/pricing');
    }
  }, []);

  // Cargar estado de suscripción actual
  const loadSubscriptionStatus = async () => {
    try {
      const { subscription } = await getSubscriptionStatus();
      setCurrentPlan(subscription);
    } catch (error) {
      logger.error('Error loading subscription status:', error);
      // Si falla, asumir plan FREE
      setCurrentPlan({ planType: 'FREE', status: 'none', isActive: false });
    }
  };

  useEffect(() => {
    loadSubscriptionStatus();
  }, []);

  const handleCompleteUpgrade = async (setupSessionId, upgradeTo) => {
    try {
      setLoading(true);
      setErrorMessage('');
      setSuccessMessage('Completando upgrade...');

      const result = await completeUpgrade(setupSessionId);

      setSuccessMessage(`¡Upgrade a ${result.subscription.planType} completado exitosamente!`);
      
      // Limpiar URL
      window.history.replaceState({}, '', '/pricing');
      
      // Recargar estado de suscripción
      await loadSubscriptionStatus();
    } catch (error) {
      logger.error('Error completing upgrade:', error);
      setErrorMessage(error.message || 'Error al completar el upgrade. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planName) => {
    const userId = getCurrentUserId();
    const username = getCurrentUsername();

    if (!userId || !username) {
      setErrorMessage('Por favor inicia sesión para cambiar de plan');
      return;
    }

    // Verificar si ya tiene este plan
    if (currentPlan?.planType === planName) {
      setErrorMessage(`Ya tienes el plan ${planName} activo`);
      return;
    }

    try {
      setLoading(true);
      setLoadingPlan(planName);
      setErrorMessage('');
      setSuccessMessage('');

      logger.info(`Updating plan to: ${planName}`);

      // Intentar actualizar el plan
      const result = await updateSubscriptionPlan(planName);

      // Verificar si es un downgrade programado
      if (result.change?.effectiveDate) {
        const effectiveDate = new Date(result.change.effectiveDate).toLocaleDateString();
        setSuccessMessage(
          `Cambio a ${result.change.to} programado. Mantendrás tu plan ${result.subscription.planType} hasta el ${effectiveDate}.`
        );
      } else {
        // Upgrade inmediato
        setSuccessMessage(
          `¡Plan actualizado a ${result.subscription.planType} exitosamente! ${result.proration?.note || ''}`
        );
      }
      
      // Recargar estado de suscripción
      await loadSubscriptionStatus();
    } catch (error) {
      logger.error('Error updating plan:', error);

      // Si requiere setup de método de pago
      if (error.requiresSetup) {
        logger.info('Redirecting to payment method setup...');
        setSuccessMessage('Redirigiendo para añadir método de pago...');
        
        // Redirigir a Stripe para añadir tarjeta
        setTimeout(() => {
          window.location.href = error.setupUrl;
        }, 1000);
        return;
      }

      // Otros errores
      setErrorMessage(error.message || 'Error al actualizar el plan. Intenta de nuevo.');
    } finally {
      setLoading(false);
      setLoadingPlan(null);
    }
  };

  const getButtonText = (plan) => {
    if (loading && loadingPlan === plan.name) {
      return null; // Will show spinner
    }
    
    if (currentPlan?.planType === plan.name) {
      return 'Plan Actual';
    }
    
    if (!currentPlan?.planType || currentPlan.planType === 'FREE') {
      if (plan.name === 'FREE') return 'Plan Actual';
      return 'Comenzar';
    }
    
    const currentIndex = plans.findIndex(p => p.name === currentPlan.planType);
    const targetIndex = plans.findIndex(p => p.name === plan.name);
    
    return targetIndex > currentIndex ? 'Upgrade' : 'Cambiar';
  };

  const getButtonClass = (plan) => {
    if (currentPlan?.planType === plan.name) {
      return 'plan-button current-plan';
    }
    return plan.popular ? 'plan-button primary' : 'plan-button secondary';
  };

  return (
    <div className="pricing-page">
      {/* Glow effect */}
      <div className="pricing-glow"></div>

      <div className="pricing-container">
        {/* Header */}
        <header className="pricing-header">
          <h1 className="pricing-title">Elige tu Plan</h1>
          <p className="pricing-subtitle">
            Desbloquea todo tu potencial como productor. Actualiza cuando quieras, cancela cuando quieras.
          </p>
        </header>

        {/* Current Plan Badge */}
        {currentPlan && currentPlan.isActive && (
          <div className="current-plan-badge">
            <span>Tu plan actual:</span>
            <span className="plan-name">{currentPlan.planType}</span>
            {currentPlan.cancelAtPeriodEnd && (
              <span className="cancel-notice">
                (se cancelará el {new Date(currentPlan.currentPeriodEnd).toLocaleDateString()})
              </span>
            )}
          </div>
        )}

        {/* Messages */}
        {successMessage && (
          <div className="pricing-message success">
            <span className="pricing-message-icon">✓</span>
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="pricing-message error">
            <span className="pricing-message-icon">!</span>
            {errorMessage}
          </div>
        )}

        {/* Plans Grid */}
        <div className="pricing-plans">
          {plans.map((plan) => (
            <div 
              key={plan.name} 
              className={`plan-card ${plan.popular ? 'popular' : ''} ${currentPlan?.planType === plan.name ? 'current' : ''}`}
            >
              {plan.popular && <span className="popular-badge">Más Popular</span>}
              
              {/* Plan Header */}
              <div className="plan-header">
                <div className="plan-icon">{plan.icon}</div>
                <h2 className="plan-name">{plan.displayName}</h2>
                <p className="plan-description">{plan.description}</p>
              </div>

              {/* Pricing */}
              <div className="plan-pricing">
                <div className="plan-price">
                  <span className="price-currency">{plan.currency}</span>
                  <span className="price-amount">{plan.price}</span>
                  <span className="price-period">/{plan.period}</span>
                </div>
              </div>

              {/* Features */}
              <ul className="plan-features">
                {plan.features.map((feature, index) => (
                  <li key={index}>
                    <span className={`feature-icon ${!feature.included ? 'disabled' : ''}`}>
                      {feature.included ? '✓' : '✗'}
                    </span>
                    <span className={`feature-text ${!feature.included ? 'disabled' : ''}`}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Button */}
              <button 
                onClick={() => handleSubscribe(plan.name)}
                disabled={loading || (currentPlan?.planType === plan.name)}
                className={getButtonClass(plan)}
              >
                {loading && loadingPlan === plan.name ? (
                  <span className="spinner"></span>
                ) : (
                  getButtonText(plan)
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;
