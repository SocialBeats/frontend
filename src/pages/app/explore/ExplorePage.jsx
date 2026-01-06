import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import BeatsExploreSection from './components/BeatsExploreSection';
import UsersExploreSection from './components/UsersExploreSection';
import Button from '@/components/ui/Button';
import './ExplorePage.css';


/**
 * ExplorePage - Vista general de exploración
 * 
 * Esta página está diseñada de forma modular para que cada microservicio
 * pueda añadir su propia sección de exploración.
 * 
 * La barra de búsqueda es global y pasa el término a todas las secciones,
 * permitiendo buscar beats, playlists, usuarios, etc. desde un solo input.
 * 
 * Secciones disponibles:
 * - BeatsExploreSection: Exploración de beats (beats-upload microservice)
 * - [Futuro] PlaylistsExploreSection: Exploración de playlists
 * - [Futuro] ArtistsExploreSection: Exploración de artistas
 * - [Futuro] StatsExploreSection: Estadísticas generales
 */
export default function ExplorePage() {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const goToPublicPlaylists = () => navigate(`/app/playlists`);


    // Debounce de la búsqueda global
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const sections = [
        { id: 'all', label: 'Todo', icon: '🎵' },
        { id: 'beats', label: 'Beats', icon: '🎹' },
        { id: 'users', label: 'Usuarios', icon: '👥' },
        // Futuras secciones de otros microservicios:
        // { id: 'playlists', label: 'Playlists', icon: '📋' },
        // { id: 'artists', label: 'Artistas', icon: '🎤' },
        // { id: 'stats', label: 'Estadísticas', icon: '📊' },
    ];

    const handleClearSearch = () => {
        setSearchTerm('');
        setDebouncedSearch('');
    };

    const renderSections = () => {
        switch (activeSection) {
            case 'beats':
                return <BeatsExploreSection searchTerm={debouncedSearch} onClearSearch={handleClearSearch} />;
            case 'users':
                return <UsersExploreSection searchTerm={debouncedSearch} onClearSearch={handleClearSearch} />;
            case 'all':
            default:
                return (
                    <>
                        <BeatsExploreSection searchTerm={debouncedSearch} onClearSearch={handleClearSearch} />
                        <UsersExploreSection searchTerm={debouncedSearch} onClearSearch={handleClearSearch} />
                        {/* Aquí se añadirán más secciones de otros microservicios */}
                        {/* <PlaylistsExploreSection searchTerm={debouncedSearch} onClearSearch={handleClearSearch} /> */}
                        {/* <ArtistsExploreSection searchTerm={debouncedSearch} onClearSearch={handleClearSearch} /> */}
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

                <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                <Button onClick={goToPublicPlaylists}>
                    Explorar playlists públicas
                </Button>
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

                {/* Barra de búsqueda global */}
                <div className="explore-search-container">
                    <div className="explore-search-wrapper">
                        <Search className="explore-search-icon" size={22} />
                        <input
                            type="text"
                            placeholder="Buscar beats, playlists, artistas..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="explore-search-input"
                        />
                        {searchTerm && (
                            <button
                                className="explore-search-clear"
                                onClick={handleClearSearch}
                                aria-label="Limpiar búsqueda"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="explore-content">
                {renderSections()}
            </main>
        </div>
    );
}
