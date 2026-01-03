import React, { useState, useEffect, useRef } from 'react';
import { 
  updateSubscriptionPlan, 
  completeUpgrade, 
  getSubscriptionStatus,
  getMyAddOns,
  purchaseAddOn,
  cancelAddOn,
  completeAddOnSetup 
} from '../services/paymentService';
import { getCurrentUserId, getCurrentUsername } from '../services/authService';
import { logger } from '../logger';
import PricingConfirmModal from './pricing/PricingConfirmModal';
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
    price: 29.99,
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

// AddOns configuration - matches backend plans.config.js
const addOns = [
  {
    name: 'decoratives',
    displayName: 'Decorativos',
    description: 'Personaliza tu perfil con badges, efectos y decoraciones exclusivas',
    price: 0.99,
    currency: '€',
    period: 'mes',
    icon: '✨',
    availableFor: ['FREE', 'PRO'],
    features: ['Badges exclusivos', 'Efectos de perfil', 'Decoraciones especiales'],
  },
  {
    name: 'promotedBeat',
    displayName: 'Beat Promocionado',
    description: 'Destaca tu mejor beat en el feed principal',
    price: 2.99,
    currency: '€',
    period: 'mes',
    icon: '📣',
    availableFor: ['PRO', 'STUDIO'],
    features: ['Visibilidad premium', 'Posición destacada', 'Más reproducciones'],
  },
  {
    name: 'extraDashboard',
    displayName: 'Dashboard Extra',
    description: 'Añade un dashboard adicional para organizar tus métricas',
    price: 1.49,
    currency: '€',
    period: 'mes',
    icon: '📊',
    availableFor: ['FREE', 'PRO'],
    features: ['+1 dashboard', 'Organiza métricas', 'Personalización total'],
  },
];

const Pricing = () => {
  const [loading, setLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [loadingAddOn, setLoadingAddOn] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [activeAddOns, setActiveAddOns] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Estados para el modal de confirmación
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalType, setConfirmModalType] = useState('plan'); // 'plan' | 'addon' | 'cancel-addon'
  const [pendingAction, setPendingAction] = useState(null); // { type, data }
  
  // Ref para evitar doble ejecución del setup (React Strict Mode)
  const setupProcessedRef = useRef(false);

  // Verificar parámetros de URL (success/cancel de Stripe y setup)
  useEffect(() => {
    // Evitar doble ejecución en React Strict Mode
    if (setupProcessedRef.current) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const setup = urlParams.get('setup');
    const sessionId = urlParams.get('session_id');
    const addonSetup = urlParams.get('addon');

    // Retorno de setup para AddOn
    if (setup === 'success' && sessionId && addonSetup) {
      setupProcessedRef.current = true;
      // Limpiar URL inmediatamente para evitar reprocesar
      window.history.replaceState({}, '', window.location.pathname);
      logger.info('AddOn setup completed, completing purchase...');
      handleCompleteAddOnSetup(addonSetup);
      return;
    }

    const upgradeTo = urlParams.get('upgrade_to');

    // Retorno de setup (después de añadir método de pago para plan)
    if (setup === 'success' && sessionId) {
      setupProcessedRef.current = true;
      // Limpiar URL inmediatamente
      window.history.replaceState({}, '', window.location.pathname);
      logger.info('Setup completed, completing upgrade...');
      handleCompleteUpgrade(sessionId, upgradeTo);
      return;
    }

    if (setup === 'canceled') {
      setErrorMessage('Añadir método de pago cancelado. Puedes intentar de nuevo cuando quieras.');
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }

    const success = urlParams.get('success');
    const canceled = urlParams.get('canceled');

    // Retorno de checkout (flujo antiguo, por si acaso)
    if (success === 'true') {
      setSuccessMessage('¡Suscripción creada exitosamente! Tu plan se activará en breve.');
      window.history.replaceState({}, '', window.location.pathname);
      loadSubscriptionStatus();
    }

    if (canceled === 'true') {
      setErrorMessage('Pago cancelado. Puedes intentar de nuevo cuando quieras.');
      window.history.replaceState({}, '', window.location.pathname);
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

  // Cargar AddOns del usuario
  const loadUserAddOns = async () => {
    try {
      const { activeAddOns: userAddOns } = await getMyAddOns();
      setActiveAddOns(userAddOns || []);
    } catch (error) {
      logger.error('Error loading user add-ons:', error);
      setActiveAddOns([]);
    }
  };

  useEffect(() => {
    loadSubscriptionStatus();
    loadUserAddOns();
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
      await loadUserAddOns();
    } catch (error) {
      logger.error('Error completing upgrade:', error);
      setErrorMessage(error.message || 'Error al completar el upgrade. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteAddOnSetup = async (addonName) => {
    try {
      setLoading(true);
      setLoadingAddOn(addonName);
      setErrorMessage('');
      setSuccessMessage('Completando compra del add-on...');

      const result = await completeAddOnSetup(addonName);

      setSuccessMessage(`¡Add-on "${result.addon.displayName}" activado exitosamente!`);
      
      // Recargar add-ons
      await loadUserAddOns();
    } catch (error) {
      logger.error('Error completing add-on setup:', error);
      setErrorMessage(error.message || 'Error al completar la compra del add-on.');
    } finally {
      setLoading(false);
      setLoadingAddOn(null);
    }
  };

  // Calcular add-ons incompatibles con un plan
  const getIncompatibleAddOns = (targetPlanName) => {
    return activeAddOns.filter(activeAddon => {
      const addonConfig = addOns.find(a => a.name === activeAddon.name);
      return addonConfig && !addonConfig.availableFor.includes(targetPlanName);
    }).map(activeAddon => {
      const config = addOns.find(a => a.name === activeAddon.name);
      return config || activeAddon;
    });
  };

  // Mostrar modal de confirmación para cambio de plan
  const handleSubscribeClick = (planName) => {
    const userId = getCurrentUserId();
    const username = getCurrentUsername();

    if (!userId || !username) {
      setErrorMessage('Por favor inicia sesión para cambiar de plan');
      return;
    }

    if (currentPlan?.planType === planName) {
      setErrorMessage(`Ya tienes el plan ${planName} activo`);
      return;
    }

    const targetPlan = plans.find(p => p.name === planName);
    const incompatible = getIncompatibleAddOns(planName);

    setPendingAction({
      type: 'plan',
      planName,
      targetPlan,
      incompatibleAddOns: incompatible,
    });
    setConfirmModalType('plan');
    setShowConfirmModal(true);
  };

  // Ejecutar cambio de plan (después de confirmación)
  const executeSubscribe = async () => {
    if (!pendingAction || pendingAction.type !== 'plan') return;
    
    const planName = pendingAction.planName;

    try {
      setLoading(true);
      setLoadingPlan(planName);
      setErrorMessage('');
      setSuccessMessage('');

      logger.info(`Updating plan to: ${planName}`);

      const result = await updateSubscriptionPlan(planName);

      // Cerrar modal
      setShowConfirmModal(false);
      setPendingAction(null);

      // Verificar si es un downgrade programado
      if (result.change?.effectiveDate) {
        const effectiveDate = new Date(result.change.effectiveDate).toLocaleDateString();
        setSuccessMessage(
          `Cambio a ${result.change.to} programado. Mantendrás tu plan ${result.subscription.planType} hasta el ${effectiveDate}.`
        );
      } else {
        let msg = `¡Plan actualizado a ${result.subscription.planType} exitosamente!`;
        
        if (result.removedAddOns?.count > 0) {
          msg += ` Se cancelaron ${result.removedAddOns.count} add-on(s) incompatibles.`;
        }
        
        setSuccessMessage(msg);
      }
      
      await loadSubscriptionStatus();
      await loadUserAddOns();
    } catch (error) {
      logger.error('Error updating plan:', error);

      if (error.requiresSetup) {
        setShowConfirmModal(false);
        setPendingAction(null);
        logger.info('Redirecting to payment method setup...');
        setSuccessMessage('Redirigiendo para añadir método de pago...');
        
        setTimeout(() => {
          window.location.href = error.setupUrl;
        }, 1000);
        return;
      }

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

  // ====================================================================
  // ADDON HANDLERS
  // ====================================================================

  const isAddOnActive = (addonName) => {
    return activeAddOns.some(addon => addon.name === addonName && addon.status === 'active');
  };

  const isAddOnAvailable = (addon) => {
    const userPlan = currentPlan?.planType || 'FREE';
    return addon.availableFor.includes(userPlan);
  };

  // Mostrar modal de confirmación para comprar add-on
  const handlePurchaseAddOnClick = (addonName) => {
    const userId = getCurrentUserId();
    const username = getCurrentUsername();

    if (!userId || !username) {
      setErrorMessage('Por favor inicia sesión para comprar add-ons');
      return;
    }

    if (isAddOnActive(addonName)) {
      setErrorMessage('Ya tienes este add-on activo');
      return;
    }

    const addonConfig = addOns.find(a => a.name === addonName);
    
    setPendingAction({
      type: 'addon',
      addonName,
      addon: addonConfig,
    });
    setConfirmModalType('addon');
    setShowConfirmModal(true);
  };

  // Ejecutar compra de add-on (después de confirmación)
  const executePurchaseAddOn = async () => {
    if (!pendingAction || pendingAction.type !== 'addon') return;
    
    const addonName = pendingAction.addonName;

    try {
      setLoading(true);
      setLoadingAddOn(addonName);
      setErrorMessage('');
      setSuccessMessage('');

      logger.info(`Purchasing add-on: ${addonName}`);

      const result = await purchaseAddOn(addonName);

      setShowConfirmModal(false);
      setPendingAction(null);
      
      setSuccessMessage(`¡Add-on "${result.addon.displayName}" activado exitosamente!`);
      
      await loadUserAddOns();
    } catch (error) {
      logger.error('Error purchasing add-on:', error);

      if (error.requiresSetup) {
        setShowConfirmModal(false);
        setPendingAction(null);
        logger.info('Redirecting to payment method setup for add-on...');
        setSuccessMessage('Redirigiendo para añadir método de pago...');
        
        setTimeout(() => {
          window.location.href = error.setupUrl;
        }, 1000);
        return;
      }

      setErrorMessage(error.message || 'Error al comprar el add-on. Intenta de nuevo.');
    } finally {
      setLoading(false);
      setLoadingAddOn(null);
    }
  };

  // Mostrar modal de confirmación para cancelar add-on
  const handleCancelAddOnClick = (addonName) => {
    const addonConfig = addOns.find(a => a.name === addonName);
    const activeAddon = activeAddOns.find(a => a.name === addonName);
    
    setPendingAction({
      type: 'cancel-addon',
      addonName,
      addon: { ...addonConfig, ...activeAddon },
    });
    setConfirmModalType('cancel-addon');
    setShowConfirmModal(true);
  };

  // Ejecutar cancelación de add-on (después de confirmación)
  const executeCancelAddOn = async () => {
    if (!pendingAction || pendingAction.type !== 'cancel-addon') return;
    
    const addonName = pendingAction.addonName;

    try {
      setLoading(true);
      setLoadingAddOn(addonName);
      setErrorMessage('');
      setSuccessMessage('');

      logger.info(`Canceling add-on: ${addonName}`);

      const result = await cancelAddOn(addonName);

      setShowConfirmModal(false);
      setPendingAction(null);
      
      setSuccessMessage(`Add-on "${result.addon.displayName}" cancelado. Seguirá activo hasta el final del período.`);
      
      await loadUserAddOns();
    } catch (error) {
      logger.error('Error canceling add-on:', error);
      setErrorMessage(error.message || 'Error al cancelar el add-on. Intenta de nuevo.');
    } finally {
      setLoading(false);
      setLoadingAddOn(null);
    }
  };

  // Handler para confirmar acción del modal
  const handleConfirmAction = async () => {
    if (!pendingAction) return;

    switch (pendingAction.type) {
      case 'plan':
        await executeSubscribe();
        break;
      case 'addon':
        await executePurchaseAddOn();
        break;
      case 'cancel-addon':
        await executeCancelAddOn();
        break;
      default:
        break;
    }
  };

  // Cerrar modal y limpiar estado
  const handleCloseModal = () => {
    if (loading) return; // No cerrar mientras está cargando
    setShowConfirmModal(false);
    setPendingAction(null);
  };

  const getAddOnButtonText = (addon) => {
    if (loading && loadingAddOn === addon.name) {
      return null; // Will show spinner
    }
    
    if (isAddOnActive(addon.name)) {
      return 'Cancelar';
    }
    
    if (!isAddOnAvailable(addon)) {
      return 'No disponible';
    }
    
    return 'Añadir';
  };

  const getAddOnButtonClass = (addon) => {
    if (isAddOnActive(addon.name)) {
      return 'addon-button cancel';
    }
    if (!isAddOnAvailable(addon)) {
      return 'addon-button disabled';
    }
    return 'addon-button primary';
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

        {/* Pending Plan Change Notice */}
        {currentPlan?.pendingPlanChange && (
          <div className="pending-change-notice">
            <span className="pending-change-icon">📅</span>
            <span>
              Cambio a <strong>{currentPlan.pendingPlanChange}</strong> programado. 
              Mantendrás tu plan <strong>{currentPlan.planType}</strong> hasta el{' '}
              <strong>{new Date(currentPlan.pendingChangeDate).toLocaleDateString()}</strong>.
            </span>
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
                onClick={() => handleSubscribeClick(plan.name)}
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

        {/* AddOns Section */}
        <section className="addons-section">
          <header className="addons-header">
            <h2 className="addons-title">Potencia tu experiencia</h2>
            <p className="addons-subtitle">
              Personaliza tu plan con add-ons exclusivos. Activa o cancela cuando quieras.
            </p>
          </header>

          <div className="addons-grid">
            {addOns.map((addon) => {
              const isActive = isAddOnActive(addon.name);
              const isAvailable = isAddOnAvailable(addon);
              
              return (
                <div 
                  key={addon.name} 
                  className={`addon-card ${isActive ? 'active' : ''} ${!isAvailable ? 'unavailable' : ''}`}
                >
                  {isActive && <span className="addon-active-badge">Activo</span>}
                  
                  <div className="addon-header">
                    <div className="addon-icon">{addon.icon}</div>
                    <div className="addon-info">
                      <h3 className="addon-name">{addon.displayName}</h3>
                      <p className="addon-description">{addon.description}</p>
                    </div>
                  </div>

                  <div className="addon-pricing">
                    <span className="addon-price">
                      {addon.currency}{addon.price}
                    </span>
                    <span className="addon-period">/{addon.period}</span>
                  </div>

                  <ul className="addon-features">
                    {addon.features.map((feature, index) => (
                      <li key={index}>
                        <span className="feature-check">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {!isAvailable && (
                    <p className="addon-availability">
                      Disponible para: {addon.availableFor.join(', ')}
                    </p>
                  )}

                  <button
                    onClick={() => isActive 
                      ? handleCancelAddOnClick(addon.name) 
                      : handlePurchaseAddOnClick(addon.name)
                    }
                    disabled={loading || (!isAvailable && !isActive)}
                    className={getAddOnButtonClass(addon)}
                  >
                    {loading && loadingAddOn === addon.name ? (
                      <span className="spinner"></span>
                    ) : (
                      getAddOnButtonText(addon)
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Modal de confirmación */}
      <PricingConfirmModal
        isOpen={showConfirmModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirmAction}
        type={confirmModalType}
        loading={loading}
        currentPlan={currentPlan}
        targetPlan={pendingAction?.targetPlan}
        addon={pendingAction?.addon}
        incompatibleAddOns={pendingAction?.incompatibleAddOns || []}
      />
    </div>
  );
};

export default Pricing;
