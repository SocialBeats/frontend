import React, { useState, useEffect } from 'react';
import { updateSubscriptionPlan, completeUpgrade, getSubscriptionStatus } from '../services/paymentService';
import { getCurrentUserId, getCurrentUsername } from '../services/authService';
import { logger } from '../logger';

const plans = [
  {
    name: 'BASIC',
    description: 'Enjoy daily news about the SPACE!',
    price: 0.0,
    currency: 'EUR',
    unit: 'user/month',
    features: ['Check SPACE news for free!', 'Max 2 news/day'],
  },
  {
    name: 'PREMIUM',
    description: 'Disable ads and read more news!',
    price: 10.0,
    currency: 'EUR',
    unit: 'user/month',
    features: ['Disable side ads', 'Disable bottom ads', 'Max 5 news/day'],
  }
];

const Pricing = () => {
  const [loading, setLoading] = useState(false);
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
      setErrorMessage('');
      setSuccessMessage('');

      logger.info(`Updating plan to: ${planName}`);

      // Intentar actualizar el plan
      const result = await updateSubscriptionPlan(planName);

      // Si fue exitoso, mostrar mensaje
      setSuccessMessage(
        `¡Plan actualizado a ${result.subscription.planType} exitosamente! ${result.proration.note}`
      );
      
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
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Pricing Plans</h1>

      {/* Mostrar plan actual si existe */}
      {currentPlan && currentPlan.isActive && (
        <div style={{ backgroundColor: '#d4edda', color: '#155724', padding: '15px', borderRadius: '8px', marginBottom: '20px', maxWidth: '600px', margin: '0 auto 20px' }}>
          <strong>Plan actual:</strong> {currentPlan.planType}
          {currentPlan.cancelAtPeriodEnd && (
            <span> (se cancelará el {new Date(currentPlan.currentPeriodEnd).toLocaleDateString()})</span>
          )}
        </div>
      )}

      {/* Mensajes de éxito/error */}
      {successMessage && (
        <div style={{ backgroundColor: '#d4edda', color: '#155724', padding: '15px', borderRadius: '8px', marginBottom: '20px', maxWidth: '600px', margin: '0 auto 20px' }}>
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '15px', borderRadius: '8px', marginBottom: '20px', maxWidth: '600px', margin: '0 auto 20px' }}>
          {errorMessage}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', marginTop: '20px' }}>
        {plans.map((plan) => (
          <div key={plan.name} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '20px', width: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h2>{plan.name}</h2>
              <p style={{ fontStyle: 'italic', color: '#666' }}>{plan.description}</p>
              <h3 style={{ margin: '15px 0' }}>{plan.price} {plan.currency} <span style={{ fontSize: '0.8em', fontWeight: 'normal' }}>/ {plan.unit}</span></h3>
              <ul style={{ textAlign: 'left', marginBottom: '20px' }}>
                {plan.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
            <button 
              onClick={() => handleSubscribe(plan.name)}
              disabled={loading || (currentPlan?.planType === plan.name)}
              style={{ 
                padding: '10px 20px', 
                backgroundColor: (currentPlan?.planType === plan.name) ? '#6c757d' : '#007bff', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: loading ? 'wait' : (currentPlan?.planType === plan.name) ? 'not-allowed' : 'pointer', 
                fontSize: '16px',
                opacity: (currentPlan?.planType === plan.name) ? 0.6 : 1
              }}
            >
              {loading 
                ? 'Procesando...' 
                : (currentPlan?.planType === plan.name) 
                  ? 'Plan Actual' 
                  : currentPlan?.planType 
                    ? (plans.findIndex(p => p.name === plan.name) > plans.findIndex(p => p.name === currentPlan.planType) 
                        ? 'Upgrade' 
                        : 'Downgrade')
                    : 'Seleccionar'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pricing;
