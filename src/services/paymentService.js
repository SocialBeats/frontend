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
  cancelSubscription,
  redirectToCheckout,
};
