import { useState, useEffect } from 'react';
import { getMyProfile, updateMyProfile } from '@/services/profileService';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import SuccessModal from '@/components/ui/SuccessModal';
import ErrorModal from '@/components/ui/ErrorModal';
import './Profile.css';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [isEditingBasic, setIsEditingBasic] = useState(false);
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [formData, setFormData] = useState({
    full_name: '',
    about_me: '',
    contact: {
      phone: '',
      city: '',
      country: '',
      website: '',
      social_media: {
        instagram: '',
        twitter: '',
        youtube: '',
        soundcloud: '',
        spotify: '',
      },
    },
    tags: [],
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getMyProfile();
      setProfile(data);
      setFormData({
        full_name: data.full_name || '',
        about_me: data.about_me || '',
        contact: {
          phone: data.contact?.phone || '',
          city: data.contact?.city || '',
          country: data.contact?.country || '',
          website: data.contact?.website || '',
          social_media: {
            instagram: data.contact?.social_media?.instagram || '',
            twitter: data.contact?.social_media?.twitter || '',
            youtube: data.contact?.social_media?.youtube || '',
            soundcloud: data.contact?.social_media?.soundcloud || '',
            spotify: data.contact?.social_media?.spotify || '',
          },
        },
        tags: data.tags || [],
      });
    } catch (error) {
      setErrorMessage('Error al cargar el perfil');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      contact: { ...prev.contact, [name]: value },
    }));
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() && formData.tags.length < 20 && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleSubmitBasic = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateMyProfile(formData);
      setShowSuccessModal(true);
      setIsEditingBasic(false);
      await loadProfile();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Error al actualizar el perfil');
      setShowErrorModal(true);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitTags = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateMyProfile({ tags: formData.tags });
      setShowSuccessModal(true);
      setIsEditingTags(false);
      await loadProfile();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Error al actualizar las aptitudes');
      setShowErrorModal(true);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelBasic = () => {
    setIsEditingBasic(false);
    setFormData({
      full_name: profile.full_name || '',
      about_me: profile.about_me || '',
      contact: {
        phone: profile.contact?.phone || '',
        city: profile.contact?.city || '',
        country: profile.contact?.country || '',
        website: profile.contact?.website || '',
        social_media: {
          instagram: profile.contact?.social_media?.instagram || '',
          twitter: profile.contact?.social_media?.twitter || '',
          youtube: profile.contact?.social_media?.youtube || '',
          soundcloud: profile.contact?.social_media?.soundcloud || '',
          spotify: profile.contact?.social_media?.spotify || '',
        },
      },
      tags: profile.tags || [],
    });
  };

  const handleCancelTags = () => {
    setIsEditingTags(false);
    setFormData(prev => ({
      ...prev,
      tags: profile.tags || [],
    }));
    setTagInput('');
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <div className="spinner"></div>
          <p>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <div className="profile-error">
          <p>No se pudo cargar el perfil</p>
          <Button onClick={loadProfile}>Reintentar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* ========== BLOQUE PRINCIPAL - HERO ========== */}
      <div className="profile-hero">
          {/* Columna izquierda - Avatar y contacto */}
          <div className="profile-hero-left">
            <Avatar 
              src={profile.avatar || ''} 
              alt={profile.username}
              size="xlarge"
            />
            <h2 className="profile-username">{profile.username}</h2>
            
            {/* Badge de completitud */}
            <div className="profile-completion">
              <Badge variant="warning">Completa tu perfil</Badge>
            </div>
            
            {/* Info de contacto */}
            <div className="profile-contact-list">
              <p className="contact-item">{profile.email}</p>
              {formData.contact.phone && (
                <p className="contact-item">{formData.contact.phone}</p>
              )}
              {(formData.contact.city || formData.contact.country) && (
                <p className="contact-item">
                  {formData.contact.city}{formData.contact.city && formData.contact.country && ', '}{formData.contact.country}
                </p>
              )}
            </div>

            {/* Redes sociales */}
            <div className="profile-social-icons">
              <span className="social-icon spotify" title="Spotify">🎵</span>
              <span className="social-icon soundcloud" title="SoundCloud">☁️</span>
            </div>
          </div>

          {/* Columna central - Nombre + About Me + Beats */}
          <div className="profile-hero-center">
            {/* Header con nombre */}
            <div className="profile-name-header">
              <div>
                <h1 className="profile-fullname">{formData.full_name || profile.username}</h1>
              </div>
              {!isEditingBasic && (
                <Button variant="secondary" onClick={() => setIsEditingBasic(true)}>
                  Editar perfil
                </Button>
              )}
            </div>

            {/* About Me */}
            <div className="profile-about-section">
              <textarea
                name="about_me"
                value={formData.about_me}
                onChange={handleInputChange}
                disabled={!isEditingBasic}
                className={`profile-textarea ${!isEditingBasic ? 'disabled' : ''}`}
                placeholder="Cuéntanos sobre ti, tu experiencia..."
                maxLength={500}
                rows={5}
              />
              {isEditingBasic && (
                <span className="character-count">{formData.about_me.length}/500</span>
              )}
            </div>

            {/* Beats destacados - Grid de 3 */}
            <div className="profile-beats-preview">
              {[1, 2, 3].map((beat) => (
                <div key={beat} className="beat-preview-card">
                  <span className="beat-icon">🎵</span>
                </div>
              ))}
            </div>
          </div>

          {/* Columna derecha - Certificaciones */}
          <div className="profile-hero-right">
            <h3 className="certs-title">Certificaciones</h3>
            <div className="certs-list">
              <div className="cert-item">
                <span>🏆</span> Curso en Producción
              </div>
              <div className="cert-item">
                <span>🎓</span> Curso en Teoría Musical
              </div>
              <div className="cert-item">
                <span>🎹</span> Curso Electrónica
              </div>
            </div>
            <p className="certs-note">Archivos desde S3</p>
          </div>
        </div>

        {/* ========== FORMULARIO EDICIÓN BÁSICA ========== */}
        {isEditingBasic && (
          <div className="profile-section-block profile-edit-form">
            <h2>Editar información</h2>
            
            <Input
              label="Nombre completo"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              fullWidth
              placeholder="Ej: Juan Pérez"
            />

            <div className="form-row">
              <Input
                label="Teléfono"
                name="phone"
                value={formData.contact.phone}
                onChange={handleContactChange}
                fullWidth
                placeholder="+34 600 000 000"
              />
              <Input
                label="Ciudad"
                name="city"
                value={formData.contact.city}
                onChange={handleContactChange}
                fullWidth
                placeholder="Ej: Madrid"
              />
            </div>

            <div className="form-row">
              <Input
                label="País"
                name="country"
                value={formData.contact.country}
                onChange={handleContactChange}
                fullWidth
                placeholder="Ej: España"
              />
              <Input
                label="Sitio web"
                name="website"
                value={formData.contact.website}
                onChange={handleContactChange}
                fullWidth
                placeholder="https://..."
              />
            </div>

            <div className="form-actions">
              <Button type="button" variant="secondary" onClick={handleCancelBasic} disabled={saving}>
                Cancelar
              </Button>
              <Button type="button" variant="primary" onClick={handleSubmitBasic} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          </div>
        )}

        {/* ========== BLOQUE ESTUDIOS ========== */}
        <div className="profile-section-block">
          <h2>Estudios</h2>
          <p className="mocked-text">Aquí podrás añadir tu formación académica, similar a LinkedIn. Próximamente disponible.</p>
        </div>

        {/* ========== BLOQUE APTITUDES ========== */}
        <div className="profile-section-block">
          <div className="section-header">
            <h2>Aptitudes</h2>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {isEditingTags && <span className="tag-count">{formData.tags.length}/20</span>}
              {!isEditingTags && (
                <button 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Click en botón +, isEditingTags actual:', isEditingTags);
                    setIsEditingTags(true);
                  }}
                  className="btn-add-section"
                  aria-label="Editar aptitudes"
                >
                  +
                </button>
              )}
            </div>
          </div>
          
          {isEditingTags && (
            <div className="tag-input-row">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Ej: Producer, Beatmaker..."
                disabled={formData.tags.length >= 20}
              />
              <Button 
                type="button"
                onClick={handleAddTag}
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
                {isEditingTags && (
                  <button type="button" className="tag-remove" onClick={() => handleRemoveTag(index)}>×</button>
                )}
              </Badge>
            ))}
            {formData.tags.length === 0 && (
              <p className="empty-text">No hay aptitudes agregadas</p>
            )}
          </div>

          {isEditingTags && (
            <div className="form-actions">
              <Button type="button" variant="secondary" onClick={handleCancelTags} disabled={saving}>
                Cancelar
              </Button>
              <Button type="button" variant="primary" onClick={handleSubmitTags} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar aptitudes'}
              </Button>
            </div>
          )}
        </div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="¡Perfil actualizado!"
        message="Tus cambios se han guardado correctamente"
      />

      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Error"
        message={errorMessage}
      />
    </div>
  );
}
