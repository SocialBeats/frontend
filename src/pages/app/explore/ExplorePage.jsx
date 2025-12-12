import { useState } from 'react';
import BeatsExploreSection from './components/BeatsExploreSection';
import './ExplorePage.css';

/**
 * ExplorePage - Vista general de exploración
 * 
 * Esta página está diseñada de forma modular para que cada microservicio
 * pueda añadir su propia sección de exploración.
 * 
 * Secciones disponibles:
 * - BeatsExploreSection: Exploración de beats (beats-upload microservice)
 * - [Futuro] PlaylistsExploreSection: Exploración de playlists
 * - [Futuro] ArtistsExploreSection: Exploración de artistas
 * - [Futuro] StatsExploreSection: Estadísticas generales
 */
export default function ExplorePage() {
  const [activeSection, setActiveSection] = useState('all');

  const sections = [
    { id: 'all', label: 'Todo', icon: '🎵' },
    { id: 'beats', label: 'Beats', icon: '🎹' },
    // Futuras secciones de otros microservicios:
    // { id: 'playlists', label: 'Playlists', icon: '📋' },
    // { id: 'artists', label: 'Artistas', icon: '🎤' },
    // { id: 'stats', label: 'Estadísticas', icon: '📊' },
  ];

  const renderSections = () => {
    switch (activeSection) {
      case 'beats':
        return <BeatsExploreSection />;
      case 'all':
      default:
        return (
          <>
            <BeatsExploreSection />
            {/* Aquí se añadirán más secciones de otros microservicios */}
            {/* <PlaylistsExploreSection /> */}
            {/* <ArtistsExploreSection /> */}
          </>
        );
    }
  };

  return (
    <div className="explore-page">
      <header className="explore-header">
        <div className="explore-header-content">
          <h1 className="explore-title">Explorar</h1>
          <p className="explore-subtitle">
            Descubre nuevos beats, artistas y tendencias
          </p>
        </div>
        
        <nav className="explore-nav">
          {sections.map((section) => (
            <button
              key={section.id}
              className={`explore-nav-btn ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              <span className="explore-nav-icon">{section.icon}</span>
              <span className="explore-nav-label">{section.label}</span>
            </button>
          ))}
        </nav>
      </header>

      <main className="explore-content">
        {renderSections()}
      </main>
    </div>
  );
}
