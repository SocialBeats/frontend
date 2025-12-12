import { useState, useEffect } from 'react';
import { Search, Filter, X, Music, Key, Tag, Download } from 'lucide-react';
import './FilterBar.css';

/**
 * FilterBar - Barra de filtros para la exploración de beats
 * 
 * Filtros disponibles:
 * - Búsqueda por texto (nombre del beat)
 * - Género musical
 * - Clave musical
 * - Tags
 * - Descargable (sí/no)
 */

// Opciones de género del modelo Beat
const GENRES = [
  { value: '', label: 'Todos los géneros' },
  { value: 'Hip Hop', label: 'Hip Hop' },
  { value: 'Trap', label: 'Trap' },
  { value: 'R&B', label: 'R&B' },
  { value: 'Pop', label: 'Pop' },
  { value: 'Rock', label: 'Rock' },
  { value: 'Electronic', label: 'Electronic' },
  { value: 'Jazz', label: 'Jazz' },
  { value: 'Reggaeton', label: 'Reggaeton' },
  { value: 'Other', label: 'Otro' }
];

// Opciones de clave musical del modelo Beat
const KEYS = [
  { value: '', label: 'Todas las claves' },
  { value: 'C', label: 'C (Do)' },
  { value: 'C#', label: 'C# (Do#)' },
  { value: 'D', label: 'D (Re)' },
  { value: 'D#', label: 'D# (Re#)' },
  { value: 'E', label: 'E (Mi)' },
  { value: 'F', label: 'F (Fa)' },
  { value: 'F#', label: 'F# (Fa#)' },
  { value: 'G', label: 'G (Sol)' },
  { value: 'G#', label: 'G# (Sol#)' },
  { value: 'A', label: 'A (La)' },
  { value: 'A#', label: 'A# (La#)' },
  { value: 'B', label: 'B (Si)' }
];

// Opciones de descargable
const DOWNLOADABLE_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'true', label: 'Descargables' },
  { value: 'false', label: 'No descargables' }
];

export default function FilterBar({ filters, onFilterChange, onClearFilters }) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localSearch, setLocalSearch] = useState(filters.search || '');

  // Debounce para la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.search) {
        onFilterChange({ ...filters, search: localSearch });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, filters, onFilterChange]);

  // Sincronizar búsqueda local con filtros externos
  useEffect(() => {
    setLocalSearch(filters.search || '');
  }, [filters.search]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  const handleSearchChange = (e) => {
    setLocalSearch(e.target.value);
  };

  const handleClearSearch = () => {
    setLocalSearch('');
    onFilterChange({ ...filters, search: '' });
  };

  // Contar filtros activos
  const activeFiltersCount = [
    filters.genre,
    filters.key,
    filters.tags,
    filters.isDownloadable
  ].filter(Boolean).length;

  return (
    <div className="filter-bar">
      {/* Búsqueda principal */}
      <div className="filter-search-container">
        <div className="filter-search-wrapper">
          <Search className="filter-search-icon" size={20} />
          <input
            type="text"
            placeholder="Buscar beats por nombre..."
            value={localSearch}
            onChange={handleSearchChange}
            className="filter-search-input"
          />
          {localSearch && (
            <button 
              className="filter-search-clear" 
              onClick={handleClearSearch}
              aria-label="Limpiar búsqueda"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <button 
          className={`filter-toggle-btn ${showAdvanced ? 'active' : ''} ${activeFiltersCount > 0 ? 'has-filters' : ''}`}
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <Filter size={18} />
          <span>Filtros</span>
          {activeFiltersCount > 0 && (
            <span className="filter-count">{activeFiltersCount}</span>
          )}
        </button>
      </div>

      {/* Filtros avanzados */}
      {showAdvanced && (
        <div className="filter-advanced">
          <div className="filter-grid">
            {/* Género */}
            <div className="filter-group">
              <label className="filter-label">
                <Music size={14} />
                Género
              </label>
              <select
                name="genre"
                value={filters.genre}
                onChange={handleChange}
                className="filter-select"
              >
                {GENRES.map((genre) => (
                  <option key={genre.value} value={genre.value}>
                    {genre.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Clave */}
            <div className="filter-group">
              <label className="filter-label">
                <Key size={14} />
                Clave
              </label>
              <select
                name="key"
                value={filters.key}
                onChange={handleChange}
                className="filter-select"
              >
                {KEYS.map((key) => (
                  <option key={key.value} value={key.value}>
                    {key.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className="filter-group">
              <label className="filter-label">
                <Tag size={14} />
                Tags
              </label>
              <input
                type="text"
                name="tags"
                value={filters.tags}
                onChange={handleChange}
                placeholder="dark, melodic, hard..."
                className="filter-input"
              />
            </div>

            {/* Descargable */}
            <div className="filter-group">
              <label className="filter-label">
                <Download size={14} />
                Descargable
              </label>
              <select
                name="isDownloadable"
                value={filters.isDownloadable}
                onChange={handleChange}
                className="filter-select"
              >
                {DOWNLOADABLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Botón limpiar filtros */}
          {(activeFiltersCount > 0 || filters.search) && (
            <button className="filter-clear-btn" onClick={onClearFilters}>
              <X size={16} />
              Limpiar todos los filtros
            </button>
          )}
        </div>
      )}

      {/* Tags de filtros activos */}
      {activeFiltersCount > 0 && !showAdvanced && (
        <div className="filter-active-tags">
          {filters.genre && (
            <span className="filter-tag">
              {filters.genre}
              <button onClick={() => onFilterChange({ ...filters, genre: '' })}>
                <X size={12} />
              </button>
            </span>
          )}
          {filters.key && (
            <span className="filter-tag">
              Clave: {filters.key}
              <button onClick={() => onFilterChange({ ...filters, key: '' })}>
                <X size={12} />
              </button>
            </span>
          )}
          {filters.tags && (
            <span className="filter-tag">
              Tags: {filters.tags}
              <button onClick={() => onFilterChange({ ...filters, tags: '' })}>
                <X size={12} />
              </button>
            </span>
          )}
          {filters.isDownloadable && (
            <span className="filter-tag">
              {filters.isDownloadable === 'true' ? 'Descargables' : 'No descargables'}
              <button onClick={() => onFilterChange({ ...filters, isDownloadable: '' })}>
                <X size={12} />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
