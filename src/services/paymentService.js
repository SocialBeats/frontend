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

// ====================================================================
// ADDON MANAGEMENT
// ====================================================================

/**
 * Obtener todos los AddOns disponibles
 * 
 * @returns {Promise<Object>} - Lista de AddOns disponibles
 */
export const getAvailableAddOns = async () => {
  try {
    logger.info('Fetching available add-ons');

    const response = await client.get('/payments/addons');

    logger.info('Add-ons retrieved successfully');
    return response.data;
  } catch (error) {
    logger.error('Failed to get add-ons', error);
    throw new Error(
      error.response?.data?.message || 'Error al obtener los add-ons'
    );
  }
};

/**
 * Obtener los AddOns del usuario actual
 * 
 * @returns {Promise<Object>} - AddOns activos y disponibles del usuario
 */
export const getMyAddOns = async () => {
  try {
    logger.info('Fetching my add-ons');

    const response = await client.get('/payments/addons/my');

    logger.info('My add-ons retrieved successfully');
    return response.data;
  } catch (error) {
    logger.error('Failed to get my add-ons', error);

    // Si no tiene suscripción, retornar vacío
    if (error.response?.status === 404) {
      return {
        activeAddOns: [],
        availableAddOns: [],
      };
    }

    throw new Error(
      error.response?.data?.message || 'Error al obtener tus add-ons'
    );
  }
};

/**
 * Comprar un AddOn
 * 
 * @param {string} addonName - Nombre del AddOn a comprar
 * @returns {Promise<Object>} - Información de la compra
 */
export const purchaseAddOn = async (addonName) => {
  try {
    logger.info(`Purchasing add-on: ${addonName}`);

    const response = await client.post('/payments/addons/purchase', { addonName });

    logger.info('Add-on purchased successfully');
    return response.data;
  } catch (error) {
    logger.error('Failed to purchase add-on', error);

    // Error 402: Requiere método de pago
    if (error.response?.status === 402) {
      const data = error.response.data;
      logger.info('Payment method required for add-on, returning setup info');
      throw {
        requiresSetup: true,
        setupUrl: data.setupUrl,
        setupSessionId: data.setupSessionId,
        addonName: data.addonName,
        message: data.message,
      };
    }

    if (error.response?.status === 400) {
      throw new Error(error.response.data?.message || 'No puedes comprar este add-on');
    }

    if (error.response?.status === 409) {
      throw new Error('Ya tienes este add-on activo');
    }

    if (error.response?.status === 401) {
      throw new Error('Debes iniciar sesión para comprar add-ons');
    }

    throw new Error(
      error.response?.data?.message || 'Error al comprar el add-on'
    );
  }
};

/**
 * Completar compra de AddOn después de añadir método de pago
 * 
 * @param {string} addonName - Nombre del AddOn
 * @returns {Promise<Object>} - Información de la compra completada
 */
export const completeAddOnSetup = async (addonName) => {
  try {
    logger.info(`Completing add-on setup for: ${addonName}`);

    const response = await client.post('/payments/addons/complete-setup', { addonName });

    logger.info('Add-on setup completed successfully');
    return response.data;
  } catch (error) {
    logger.error('Failed to complete add-on setup', error);

    throw new Error(
      error.response?.data?.message || 'Error al completar la compra del add-on'
    );
  }
};

/**
 * Cancelar un AddOn
 * 
 * @param {string} addonName - Nombre del AddOn a cancelar
 * @returns {Promise<Object>} - Información de la cancelación
 */
export const cancelAddOn = async (addonName) => {
  try {
    logger.info(`Canceling add-on: ${addonName}`);

    const response = await client.delete(`/payments/addons/${addonName}`);

    logger.info('Add-on canceled successfully');
    return response.data;
  } catch (error) {
    logger.error('Failed to cancel add-on', error);

    if (error.response?.status === 404) {
      throw new Error('No tienes este add-on activo');
    }

    if (error.response?.status === 401) {
      throw new Error('Debes iniciar sesión para cancelar add-ons');
    }

    throw new Error(
      error.response?.data?.message || 'Error al cancelar el add-on'
    );
  }
};

export default {
  createCheckoutSession,
  getSubscriptionStatus,
  updateSubscriptionPlan,
  completeUpgrade,
  cancelSubscription,
  redirectToCheckout,
  // AddOns
  getAvailableAddOns,
  getMyAddOns,
  purchaseAddOn,
  completeAddOnSetup,
  cancelAddOn,
};
