import { useState } from 'react';
import { Filter, X, Music, Tag, Download } from 'lucide-react';
import './FilterBar.css';

/**
 * FilterBar - Barra de filtros específicos para beats
 * 
 * La búsqueda por texto está a nivel de ExplorePage (global).
 * Este componente solo maneja filtros específicos de beats:
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

// Opciones de descargable
const DOWNLOADABLE_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'true', label: 'Descargables' },
  { value: 'false', label: 'No descargables' }
];

export default function FilterBar({ filters, onFilterChange, onClearFilters }) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  // Contar filtros activos
  const activeFiltersCount = [
    filters.genre,
    filters.tags,
    filters.isDownloadable
  ].filter(Boolean).length;

  return (
    <div className="filter-bar">
      {/* Botón de filtros */}
      <div className="filter-toggle-container">
        <button 
          className={`filter-toggle-btn ${showAdvanced ? 'active' : ''} ${activeFiltersCount > 0 ? 'has-filters' : ''}`}
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <Filter size={18} />
          <span>Filtros de Beats</span>
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
          {activeFiltersCount > 0 && (
            <button className="filter-clear-btn" onClick={onClearFilters}>
              <X size={16} />
              Limpiar filtros
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
