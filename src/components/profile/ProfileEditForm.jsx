import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

/**
 * ProfileEditForm component - displays the profile editing form
 */
export default function ProfileEditForm({
  formData,
  saving,
  onInputChange,
  onContactChange,
  onSubmit,
  onCancel,
}) {
  return (
    <div className="profile-section-block profile-edit-form">
      <h2>Editar información</h2>
      
      <Input
        label="Nombre completo"
        name="full_name"
        value={formData.full_name}
        onChange={onInputChange}
        fullWidth
        placeholder="Ej: Juan Pérez"
      />

      <div className="form-row">
        <Input
          label="Teléfono"
          name="phone"
          value={formData.contact.phone}
          onChange={onContactChange}
          fullWidth
          placeholder="+34 600 000 000"
        />
        <Input
          label="Ciudad"
          name="city"
          value={formData.contact.city}
          onChange={onContactChange}
          fullWidth
          placeholder="Ej: Madrid"
        />
      </div>

      <div className="form-row">
        <Input
          label="País"
          name="country"
          value={formData.contact.country}
          onChange={onContactChange}
          fullWidth
          placeholder="Ej: España"
        />
        <Input
          label="Sitio web"
          name="website"
          value={formData.contact.website}
          onChange={onContactChange}
          fullWidth
          placeholder="https://..."
        />
      </div>

      <div className="form-actions">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
        <Button type="button" variant="primary" onClick={onSubmit} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
    </div>
  );
}
