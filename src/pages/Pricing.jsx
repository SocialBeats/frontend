import React, { useState, useEffect } from 'react';
import { redirectToCheckout, getSubscriptionStatus } from '../services/paymentService';
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

  // Verificar parámetros de URL (success/cancel de Stripe)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const canceled = urlParams.get('canceled');

    if (success === 'true') {
      setSuccessMessage('¡Suscripción creada exitosamente! Tu plan se activará en breve.');
      // Limpiar parámetros de URL
      window.history.replaceState({}, '', '/pricing');
      // Recargar estado de suscripción
      loadSubscriptionStatus();
    }

    if (canceled === 'true') {
      setErrorMessage('Pago cancelado. Puedes intentar de nuevo cuando quieras.');
      // Limpiar parámetros de URL
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

  const handleSubscribe = async (planName) => {
    const userId = getCurrentUserId();
    const username = getCurrentUsername();

    if (!userId || !username) {
      setErrorMessage('Por favor inicia sesión para suscribirte');
      return;
    }

    // Verificar si ya tiene una suscripción activa
    if (currentPlan?.isActive && currentPlan?.planType !== 'FREE') {
      setErrorMessage(`Ya tienes una suscripción activa al plan ${currentPlan.planType}`);
      return;
    }

    // Plan BASIC es gratis, no requiere pago
    if (planName === 'BASIC') {
      setErrorMessage('El plan BASIC es gratuito y ya está activo para todos los usuarios');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');
      setSuccessMessage('');

      logger.info(`Redirecting to checkout for plan: ${planName}`);

      // Redirigir a Stripe Checkout
      await redirectToCheckout(planName);
      // La redirección ocurre aquí, el código siguiente no se ejecutará
    } catch (error) {
      logger.error('Error subscribing:', error);
      setErrorMessage(error.message || 'Error al crear la sesión de pago. Intenta de nuevo.');
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
              disabled={loading || (currentPlan?.isActive && currentPlan?.planType === plan.name)}
              style={{ 
                padding: '10px 20px', 
                backgroundColor: (currentPlan?.isActive && currentPlan?.planType === plan.name) ? '#6c757d' : '#007bff', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: loading ? 'wait' : (currentPlan?.isActive && currentPlan?.planType === plan.name) ? 'not-allowed' : 'pointer', 
                fontSize: '16px',
                opacity: (currentPlan?.isActive && currentPlan?.planType === plan.name) ? 0.6 : 1
              }}
            >
              {loading ? 'Procesando...' : (currentPlan?.isActive && currentPlan?.planType === plan.name) ? 'Plan Actual' : 'Subscribe'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pricing;
