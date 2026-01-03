import React, { useEffect } from 'react';
import './PricingConfirmModal.css';

/**
 * Modal de confirmación específico para cambios de plan y compra de add-ons
 */
const PricingConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  type = 'plan', // 'plan' | 'addon' | 'cancel-addon'
  loading = false,
  // Datos del plan
  currentPlan = null,
  targetPlan = null,
  // Datos del addon
  addon = null,
  // Info adicional
  incompatibleAddOns = [],
  price = null,
}) => {
  // Cerrar con Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  // Determinar si es upgrade o downgrade
  const planOrder = { FREE: 0, PRO: 1, STUDIO: 2 };
  const isUpgrade = targetPlan && currentPlan && 
    planOrder[targetPlan.name] > planOrder[currentPlan.planType];
  const isDowngrade = targetPlan && currentPlan && 
    planOrder[targetPlan.name] < planOrder[currentPlan.planType];

  // Renderizar contenido según el tipo
  const renderContent = () => {
    switch (type) {
      case 'plan':
        return renderPlanChange();
      case 'addon':
        return renderAddOnPurchase();
      case 'cancel-addon':
        return renderAddOnCancel();
      default:
        return null;
    }
  };

  const renderPlanChange = () => {
    if (!targetPlan) return null;

    const icon = isUpgrade ? '🚀' : isDowngrade ? '📉' : '🔄';
    const title = isUpgrade 
      ? `Upgrade a ${targetPlan.name}` 
      : isDowngrade 
        ? `Cambiar a ${targetPlan.name}`
        : `Cambiar a ${targetPlan.name}`;

    return (
      <>
        <div className="pricing-modal__icon">{icon}</div>
        <h2 className="pricing-modal__title">{title}</h2>
        
        {isUpgrade ? (
          <div className="pricing-modal__message">
            <p>
              Estás a punto de actualizar de <strong>{currentPlan?.planType}</strong> a{' '}
              <strong>{targetPlan.name}</strong>.
            </p>
            <div className="pricing-modal__price-box">
              <span className="pricing-modal__price">
                {targetPlan.price}€<span>/mes</span>
              </span>
            </div>
            <p className="pricing-modal__note">
              ✨ El cambio será <strong>inmediato</strong> y se te cobrará la diferencia 
              prorrateada en tu próxima factura.
            </p>
            {incompatibleAddOns.length > 0 && (
              <div className="pricing-modal__warning">
                <span className="pricing-modal__warning-icon">⚠️</span>
                <p>
                  Los siguientes add-ons no están disponibles en {targetPlan.name} y 
                  serán cancelados:
                </p>
                <ul className="pricing-modal__addon-list">
                  {incompatibleAddOns.map(addon => (
                    <li key={addon.name}>{addon.displayName}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : isDowngrade ? (
          <div className="pricing-modal__message">
            <p>
              Estás a punto de cambiar de <strong>{currentPlan?.planType}</strong> a{' '}
              <strong>{targetPlan.name}</strong>.
            </p>
            <div className="pricing-modal__price-box pricing-modal__price-box--downgrade">
              <span className="pricing-modal__price">
                {targetPlan.price === 0 ? 'Gratis' : `${targetPlan.price}€/mes`}
              </span>
            </div>
            <p className="pricing-modal__note">
              📅 Mantendrás tu plan actual hasta el final del período de facturación. 
              El cambio se aplicará automáticamente en la próxima renovación.
            </p>
            {incompatibleAddOns.length > 0 && (
              <div className="pricing-modal__warning">
                <span className="pricing-modal__warning-icon">⚠️</span>
                <p>
                  Los siguientes add-ons serán cancelados junto con el cambio de plan:
                </p>
                <ul className="pricing-modal__addon-list">
                  {incompatibleAddOns.map(addon => (
                    <li key={addon.name}>{addon.displayName}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : null}

        <div className="pricing-modal__features">
          <h4>Incluido en {targetPlan.name}:</h4>
          <ul>
            {targetPlan.features?.slice(0, 4).map((feature, idx) => (
              <li key={idx}>
                {feature.included !== false && '✓'} {feature.text || feature}
              </li>
            ))}
          </ul>
        </div>
      </>
    );
  };

  const renderAddOnPurchase = () => {
    if (!addon) return null;

    return (
      <>
        <div className="pricing-modal__icon">{addon.icon || '📦'}</div>
        <h2 className="pricing-modal__title">Activar {addon.displayName}</h2>
        
        <div className="pricing-modal__message">
          <p>{addon.description}</p>
          
          <div className="pricing-modal__price-box">
            <span className="pricing-modal__price">
              {addon.price}€<span>/mes</span>
            </span>
          </div>

          <div className="pricing-modal__features pricing-modal__features--addon">
            <h4>Este add-on incluye:</h4>
            <ul>
              {addon.features?.map((feature, idx) => (
                <li key={idx}>✓ {feature}</li>
              ))}
            </ul>
          </div>

          <p className="pricing-modal__note">
            💡 Se añadirá a tu factura mensual. Puedes cancelarlo en cualquier 
            momento y dejará de renovarse en el siguiente ciclo.
          </p>
        </div>
      </>
    );
  };

  const renderAddOnCancel = () => {
    if (!addon) return null;

    return (
      <>
        <div className="pricing-modal__icon">🗑️</div>
        <h2 className="pricing-modal__title">Cancelar {addon.displayName}</h2>
        
        <div className="pricing-modal__message">
          <p>
            ¿Estás seguro de que quieres cancelar el add-on{' '}
            <strong>{addon.displayName}</strong>?
          </p>
          
          <p className="pricing-modal__note">
            ⏰ El add-on seguirá activo hasta el final de tu período de facturación 
            actual. Después dejará de estar disponible.
          </p>

          <div className="pricing-modal__warning pricing-modal__warning--info">
            <span className="pricing-modal__warning-icon">💰</span>
            <p>
              Dejarás de pagar <strong>{addon.price}€/mes</strong> a partir del 
              próximo ciclo de facturación.
            </p>
          </div>
        </div>
      </>
    );
  };

  const getConfirmButtonText = () => {
    if (loading) return 'Procesando...';
    
    switch (type) {
      case 'plan':
        return isUpgrade ? `Upgrade a ${targetPlan?.name}` : 'Confirmar cambio';
      case 'addon':
        return `Activar por ${addon?.price}€/mes`;
      case 'cancel-addon':
        return 'Cancelar add-on';
      default:
        return 'Confirmar';
    }
  };

  const getConfirmButtonClass = () => {
    if (type === 'cancel-addon') return 'pricing-modal__btn--danger';
    if (isDowngrade) return 'pricing-modal__btn--warning';
    return 'pricing-modal__btn--primary';
  };

  return (
    <div className="pricing-modal__backdrop" onClick={!loading ? onClose : undefined}>
      <div className="pricing-modal" onClick={(e) => e.stopPropagation()}>
        <button 
          className="pricing-modal__close" 
          onClick={onClose}
          disabled={loading}
          aria-label="Cerrar"
        >
          ✕
        </button>

        <div className="pricing-modal__content">
          {renderContent()}
        </div>

        <div className="pricing-modal__actions">
          <button
            className="pricing-modal__btn pricing-modal__btn--secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            className={`pricing-modal__btn ${getConfirmButtonClass()}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading && <span className="pricing-modal__spinner"></span>}
            {getConfirmButtonText()}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PricingConfirmModal;
