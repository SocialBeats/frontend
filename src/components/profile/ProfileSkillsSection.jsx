import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

/**
 * ProfileSkillsSection component - displays and manages profile skills/tags
 */
export default function ProfileSkillsSection({
  formData,
  isOwnProfile,
  isEditingTags,
  saving,
  tagInput,
  onTagInputChange,
  onEditClick,
  onAddTag,
  onRemoveTag,
  onSubmit,
  onCancel,
}) {
  return (
    <div className="profile-section-block">
      <div className="section-header">
        <h2>Aptitudes</h2>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {isEditingTags && <span className="tag-count">{formData.tags.length}/20</span>}
          {isOwnProfile && !isEditingTags && (
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEditClick();
              }}
              className="btn-add-section"
              aria-label="Editar aptitudes"
            >
              +
            </button>
          )}
        </div>
      </div>
      
      {isEditingTags && isOwnProfile && (
        <div className="tag-input-row">
          <Input
            value={tagInput}
            onChange={onTagInputChange}
            placeholder="Ej: Producer, Beatmaker..."
            disabled={formData.tags.length >= 20}
          />
          <Button 
            type="button"
            onClick={onAddTag}
            disabled={!tagInput.trim() || formData.tags.length >= 20}
            variant="secondary"
          >
            +
          </Button>
        </div>
      )}

      <div className="tags-row">
        {formData.tags.map((tag, index) => (
          <Badge key={index} variant="secondary" className="tag-badge">
            {tag}
            {isEditingTags && isOwnProfile && (
              <button type="button" className="tag-remove" onClick={() => onRemoveTag(index)}>×</button>
            )}
          </Badge>
        ))}
        {formData.tags.length === 0 && (
          <p className="empty-text">No hay aptitudes agregadas</p>
        )}
      </div>

      {isEditingTags && isOwnProfile && (
        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>
            Cancelar
          </Button>
          <Button type="button" variant="primary" onClick={onSubmit} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar aptitudes'}
          </Button>
        </div>
      )}
    </div>
  );
}
