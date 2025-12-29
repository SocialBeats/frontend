import { client } from '@/api/axiosClient';
import { logger } from '@/logger';

/**
 * Crear una sesión de checkout de Stripe
 *
 * @param {string} planType - Tipo de plan (BASIC, PRO, PREMIUM, ENTERPRISE)
 * @param {string} email - Email del usuario (opcional)
 * @returns {Promise<Object>} - Respuesta con checkoutUrl y sessionId
 */
export const createCheckoutSession = async (planType, email = null) => {
  try {
    logger.info(`Creating checkout session for plan: ${planType}`);

    const payload = { planType };
    if (email) {
      payload.email = email;
    }

    const response = await client.post('/payments/checkout', payload);

    logger.info('Checkout session created successfully');
    return response.data;
  } catch (error) {
    logger.error('Failed to create checkout session', error);

    // Manejar errores específicos
    if (error.response?.status === 409) {
      throw new Error('Ya tienes una suscripción activa');
    }

    if (error.response?.status === 401) {
      throw new Error('Debes iniciar sesión para suscribirte');
    }

    throw new Error(
      error.response?.data?.message || 'Error al crear la sesión de pago'
    );
  }
};

/**
 * Obtener el estado de la suscripción del usuario actual
 *
 * @returns {Promise<Object>} - Información de la suscripción
 */
export const getSubscriptionStatus = async () => {
  try {
    logger.info('Fetching subscription status');

    const response = await client.get('/payments/subscription');

    logger.info('Subscription status retrieved successfully');
    return response.data;
  } catch (error) {
    logger.error('Failed to get subscription status', error);

    // Si no se encuentra suscripción, retornar plan FREE por defecto
    if (error.response?.status === 404) {
      return {
        subscription: {
          planType: 'FREE',
          status: 'none',
          isActive: false,
        },
      };
    }

    throw new Error(
      error.response?.data?.message || 'Error al obtener estado de suscripción'
    );
  }
};

/**
 * Actualizar el plan de suscripción del usuario
 *
 * @param {string} planType - Nuevo tipo de plan (BASIC, PREMIUM)
 * @param {string} prorationBehavior - Comportamiento del prorrateo (opcional)
 * @returns {Promise<Object>} - Información de la suscripción actualizada
 */
export const updateSubscriptionPlan = async (planType, prorationBehavior = 'create_prorations') => {
  try {
    logger.info(`Updating subscription plan to: ${planType}`);

    const response = await client.put('/payments/subscription', {
      planType,
      prorationBehavior,
    });

    logger.info('Subscription plan updated successfully');
    return response.data;
  } catch (error) {
    logger.error('Failed to update subscription plan', error);

    // Error 402: Requiere método de pago
    if (error.response?.status === 402) {
      const data = error.response.data;
      logger.info('Payment method required, returning setup info');
      // Re-lanzar con la información de setup
      throw {
        requiresSetup: true,
        setupUrl: data.setupUrl,
        setupSessionId: data.setupSessionId,
        message: data.message,
      };
    }

    if (error.response?.status === 400 && error.response.data?.error === 'SAME_PLAN') {
      throw new Error('Ya tienes este plan activo');
    }

    if (error.response?.status === 401) {
      throw new Error('Debes iniciar sesión para actualizar tu plan');
    }

    throw new Error(
      error.response?.data?.message || 'Error al actualizar el plan'
    );
  }
};

/**
 * Completar upgrade después de añadir método de pago
 *
 * @param {string} setupSessionId - ID de la sesión de setup completada
 * @returns {Promise<Object>} - Información de la suscripción actualizada
 */
export const completeUpgrade = async (setupSessionId) => {
  try {
    logger.info('Completing upgrade after payment method setup');

    const response = await client.post('/payments/subscription/complete-upgrade', {
      setupSessionId,
    });

    logger.info('Upgrade completed successfully');
    return response.data;
  } catch (error) {
    logger.error('Failed to complete upgrade', error);

    if (error.response?.status === 400) {
      throw new Error(error.response.data?.message || 'La sesión de pago no es válida');
    }

    if (error.response?.status === 404) {
      throw new Error('No se encontró tu suscripción');
    }

    throw new Error(
      error.response?.data?.message || 'Error al completar el upgrade'
    );
  }
};

/**
 * Cancelar la suscripción del usuario actual
 *
 * @param {boolean} immediate - Si cancelar inmediatamente o al final del período
 * @returns {Promise<Object>} - Información de la suscripción cancelada
 */
export const cancelSubscription = async (immediate = false) => {
  try {
    logger.info(`Canceling subscription (immediate: ${immediate})`);

    const response = await client.delete('/payments/subscription', {
      data: { immediate },
    });

    logger.info('Subscription canceled successfully');
    return response.data;
  } catch (error) {
    logger.error('Failed to cancel subscription', error);

    if (error.response?.status === 404) {
      throw new Error('No tienes una suscripción activa para cancelar');
    }

    if (error.response?.status === 401) {
      throw new Error('Debes iniciar sesión para cancelar tu suscripción');
    }

    throw new Error(
      error.response?.data?.message || 'Error al cancelar la suscripción'
    );
  }
};

/**
 * Redirigir al usuario a Stripe Checkout
 *
 * @param {string} planType - Tipo de plan (BASIC, PRO, PREMIUM, ENTERPRISE)
 * @param {string} email - Email del usuario (opcional)
 */
export const redirectToCheckout = async (planType, email = null) => {
  try {
    const { checkoutUrl } = await createCheckoutSession(planType, email);

    // Redirigir a Stripe Checkout
    window.location.href = checkoutUrl;
  } catch (error) {
    logger.error('Failed to redirect to checkout', error);
    throw error;
  }
};

export default {
  createCheckoutSession,
  getSubscriptionStatus,
  updateSubscriptionPlan,
  completeUpgrade,
  cancelSubscription,
  redirectToCheckout,
};
