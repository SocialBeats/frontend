import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBeats, searchBeats } from '../../../../services/beatsService';
import FilterBar from './FilterBar';
import BeatCard from './BeatCard.tsx';
import './BeatsExploreSection.css';

/**
 * BeatsExploreSection - Sección de exploración de beats
 * 
 * Props:
 * - searchTerm: Término de búsqueda global desde ExplorePage
 * 
 * Muestra:
 * - Barra de filtros específicos de beats (género, clave, tags, descargable)
 * - Beats más reproducidos (carrusel horizontal)
 * - Beats más recientes (grid)
 */
export default function BeatsExploreSection({ searchTerm = '', onClearSearch }) {
    const navigate = useNavigate();

    // Estados para los datos
    const [mostPlayedBeats, setMostPlayedBeats] = useState([]);
    const [recentBeats, setRecentBeats] = useState([]);
    const [filteredBeats, setFilteredBeats] = useState([]);
    const [isFiltering, setIsFiltering] = useState(false);

    // Estados de carga
    const [loadingMostPlayed, setLoadingMostPlayed] = useState(true);
    const [loadingRecent, setLoadingRecent] = useState(true);
    const [loadingFiltered, setLoadingFiltered] = useState(false);

    // Estado de filtros específicos de beats (sin búsqueda)
    const [filters, setFilters] = useState({
        genre: '',
        tags: '',
        isDownloadable: ''
    });

    // Cargar beats más reproducidos
    const loadMostPlayedBeats = useCallback(async () => {
        try {
            setLoadingMostPlayed(true);
            const data = await getBeats({
                sortBy: 'stats.plays',
                sortOrder: 'desc',
                limit: 10
            });
            setMostPlayedBeats(Array.isArray(data) ? data : data.beats || []);
        } catch (error) {
            console.error('Error loading most played beats:', error);
            setMostPlayedBeats([]);
        } finally {
            setLoadingMostPlayed(false);
        }
    }, []);

    // Cargar beats más recientes
    const loadRecentBeats = useCallback(async () => {
        try {
            setLoadingRecent(true);
            const data = await getBeats({
                sortBy: 'createdAt',
                sortOrder: 'desc',
                limit: 12
            });
            setRecentBeats(Array.isArray(data) ? data : data.beats || []);
        } catch (error) {
            console.error('Error loading recent beats:', error);
            setRecentBeats([]);
        } finally {
            setLoadingRecent(false);
        }
    }, []);

    // Cargar beats filtrados
    const loadFilteredBeats = useCallback(async (currentFilters, currentSearchTerm) => {
        try {
            setLoadingFiltered(true);

            // Construir parámetros de búsqueda
            const params = {};

            if (currentSearchTerm && currentSearchTerm.length >= 2) {
                // Usar endpoint de búsqueda si hay texto
                const data = await searchBeats(currentSearchTerm);
                let beats = Array.isArray(data) ? data : data.beats || [];

                // Aplicar filtros adicionales en el cliente
                if (currentFilters.genre) {
                    beats = beats.filter(b => b.genre === currentFilters.genre);
                }
                if (currentFilters.isDownloadable !== '') {
                    beats = beats.filter(b => b.isDownloadable === (currentFilters.isDownloadable === 'true'));
                }
                if (currentFilters.tags) {
                    const searchTags = currentFilters.tags.toLowerCase().split(',').map(t => t.trim());
                    beats = beats.filter(b =>
                        b.tags && searchTags.some(tag => b.tags.includes(tag))
                    );
                }

                setFilteredBeats(beats);
            } else {
                // Usar endpoint normal con filtros
                if (currentFilters.genre) params.genre = currentFilters.genre;
                if (currentFilters.tags) params.tags = currentFilters.tags;

                const data = await getBeats(params);
                let beats = Array.isArray(data) ? data : data.beats || [];

                // Filtros adicionales en cliente
                if (currentFilters.isDownloadable !== '') {
                    beats = beats.filter(b => b.isDownloadable === (currentFilters.isDownloadable === 'true'));
                }

                setFilteredBeats(beats);
            }
        } catch (error) {
            console.error('Error loading filtered beats:', error);
            setFilteredBeats([]);
        } finally {
            setLoadingFiltered(false);
        }
    }, []);

    // Efecto inicial - cargar datos
    useEffect(() => {
        loadMostPlayedBeats();
        loadRecentBeats();
    }, [loadMostPlayedBeats, loadRecentBeats]);

    // Detectar si hay filtros activos o búsqueda global
    useEffect(() => {
        const hasActiveFilters =
            searchTerm ||
            filters.genre ||
            filters.tags ||
            filters.isDownloadable !== '';

        setIsFiltering(hasActiveFilters);

        if (hasActiveFilters) {
            loadFilteredBeats(filters, searchTerm);
        }
    }, [filters, searchTerm, loadFilteredBeats]);

    // Manejador de cambio de filtros
    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    // Limpiar filtros y búsqueda global
    const handleClearFilters = () => {
        setFilters({
            genre: '',
            tags: '',
            isDownloadable: ''
        });
        // También limpiar la búsqueda global
        if (onClearSearch) {
            onClearSearch();
        }
    };

    // Navegar al detalle del beat
    const handleBeatClick = (beatId) => {
        navigate(`/app/beats/${beatId}`);
    };

    // Renderizar skeleton loader
    const renderSkeletons = (count, type = 'card') => {
        return Array(count).fill(0).map((_, index) => (
            <div
                key={index}
                className={`beat-skeleton ${type === 'carousel' ? 'beat-skeleton-carousel' : ''}`}
            >
                <div className="skeleton-image"></div>
                <div className="skeleton-content">
                    <div className="skeleton-title"></div>
                    <div className="skeleton-subtitle"></div>
                </div>
            </div>
        ));
    };

    return (
        <section className="beats-explore-section">
            <div className="section-header">
                <h2 className="section-title">
                    <span className="section-icon">🎹</span>
                    Beats
                </h2>
                <p className="section-description">
                    Explora nuestra colección de beats
                </p>
            </div>

            {/* Barra de filtros */}
            <FilterBar
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
            />

            {/* Mostrar resultados filtrados o secciones normales */}
            {isFiltering ? (
                <div className="filtered-results">
                    <div className="filtered-header">
                        <h3 className="subsection-title">Resultados de búsqueda</h3>
                        <span className="results-count">
                            {loadingFiltered ? 'Buscando...' : `${filteredBeats.length} beats encontrados`}
                        </span>
                    </div>

                    {loadingFiltered ? (
                        <div className="beats-grid">
                            {renderSkeletons(8)}
                        </div>
                    ) : filteredBeats.length > 0 ? (
                        <div className="beats-grid">
                            {filteredBeats.map((beat) => (
                                <BeatCard
                                    key={beat._id}
                                    beat={beat}
                                    variant="carousel"
                                    onClick={() => handleBeatClick(beat._id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="no-results">
                            <span className="no-results-icon">🔍</span>
                            <p>No se encontraron beats con estos filtros</p>
                            <button className="clear-filters-btn" onClick={handleClearFilters}>
                                Limpiar filtros
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <>
                    {/* Beats más reproducidos - Carrusel */}
                    <div className="beats-subsection">
                        <div className="subsection-header">
                            <h3 className="subsection-title">
                                <span className="subsection-icon">🔥</span>
                                Más reproducidos
                            </h3>
                        </div>

                        {loadingMostPlayed ? (
                            <div className="beats-carousel">
                                {renderSkeletons(5, 'carousel')}
                            </div>
                        ) : mostPlayedBeats.length > 0 ? (
                            <div className="beats-grid">
                                {mostPlayedBeats.map((beat) => (
                                    <BeatCard
                                        key={beat._id}
                                        beat={beat}
                                        variant="carousel"
                                        onClick={() => handleBeatClick(beat._id)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="empty-message">No hay beats disponibles</p>
                        )}
                    </div>

                    {/* Beats más recientes - Grid */}
                    <div className="beats-subsection">
                        <div className="subsection-header">
                            <h3 className="subsection-title">
                                <span className="subsection-icon">✨</span>
                                Recientes
                            </h3>
                        </div>

                        {loadingRecent ? (
                            <div className="beats-grid">
                                {renderSkeletons(8)}
                            </div>
                        ) : recentBeats.length > 0 ? (
                            <div className="beats-grid">
                                {recentBeats.map((beat) => (
                                    <BeatCard
                                        key={beat._id}
                                        beat={beat}
                                        variant="carousel"
                                        onClick={() => handleBeatClick(beat._id)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="empty-message">No hay beats recientes</p>
                        )}
                    </div>
                </>
            )}
        </section>
    );
}
