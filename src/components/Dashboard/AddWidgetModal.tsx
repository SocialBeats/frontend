import React from 'react';
import { X, BarChart3, Music, TrendingUp, Sparkles, Activity, Volume2, Layers, Zap } from 'lucide-react';
import { AVAILABLE_WIDGETS } from './type';
import './AddWidgetModal.css';

const AddWidgetModal = ({ isOpen, onClose, onAddWidget }) => {
  if (!isOpen) return null;

  const widgetsBySection = AVAILABLE_WIDGETS.reduce((acc, widget) => {
    if (!acc[widget.section]) {
      acc[widget.section] = [];
    }
    acc[widget.section].push(widget);
    return acc;
  }, {});

  const handleAddWidget = (widget) => {
    onAddWidget(widget);
    onClose();
  };

  const getSectionIcon = (section) => {
    switch (section) {
      case 'Métricas Core':
        return <Sparkles className="section-icon" />;
      case 'Tempo':
        return <Music className="section-icon" />;
      case 'Tonalidad':
        return <TrendingUp className="section-icon" />;
      case 'Perfil Melódico':
        return <Activity className="section-icon" />;
      case 'Dinámica':
        return <Volume2 className="section-icon" />;
      case 'Textura':
        return <Layers className="section-icon" />;
      case 'Articulación':
        return <Zap className="section-icon" />;
      default:
        return <BarChart3 className="section-icon" />;
    }
  };

  const getSectionGradient = (section) => {
    switch (section) {
      case 'Métricas Core':
        return 'gradient-purple';
      case 'Tempo':
        return 'gradient-blue';
      case 'Tonalidad':
        return 'gradient-pink';
      case 'Perfil Melódico':
        return 'gradient-green';
      case 'Dinámica':
        return 'gradient-orange';
      case 'Textura':
        return 'gradient-cyan';
      case 'Articulación':
        return 'gradient-yellow';
      default:
        return 'gradient-blue';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-content">
            <div className="modal-icon-wrapper">
              <Sparkles size={32} />
            </div>
            <div>
              <h2 className="modal-title">Añadir Widget</h2>
              <p className="modal-subtitle">Personaliza tu dashboard con widgets interactivos</p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          {Object.entries(widgetsBySection).map(([section, widgets]) => (
            <div key={section} className="section-group">
              <div className={`section-header ${getSectionGradient(section)}`}>
                {getSectionIcon(section)}
                <h3 className="section-title">{section}</h3>
                <span className="section-count">{widgets.length} widgets</span>
              </div>
              
              <div className="widgets-grid">
                {widgets.map((widget) => (
                  <button
                    key={widget.type}
                    onClick={() => handleAddWidget(widget)}
                    className={`widget-card ${getSectionGradient(section)}`}
                  >
                    <div className="widget-card-inner">
                      <div className="widget-icon">
                        {getSectionIcon(section)}
                      </div>
                      <h4 className="widget-title">{widget.title}</h4>
                      {widget.description && (
                        <p className="widget-description">{widget.description}</p>
                      )}
                      <div className="widget-add-icon">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M10 4v12m-6-6h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddWidgetModal;