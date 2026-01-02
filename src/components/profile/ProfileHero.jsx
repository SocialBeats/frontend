import { useRef, useState } from 'react';
import { BadgeCheck } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';

import Button from '@/components/ui/Button';
import { uploadAvatarToS3 } from '@/services/uploadService';
import ProfileCertifications from './ProfileCertifications';
import SocialLinkEditor from './SocialLinkEditor';
import { MAX_ABOUT_ME_LENGTH } from '@/pages/app/profile/ProfileView';
import { DecoratedAvatar, DecoratorSelector } from '@/components/decorators';

/**
 * ProfileHero component - displays the main profile header section
 */
export default function ProfileHero({
  profile,
  formData,
  isOwnProfile,
  isEditingBasic,
  isEditingAbout,
  saving,
  onEditClick,
  onEditAboutClick,
  onInputChange,
  onSubmitAbout,
  onCancelAbout,
  onAvatarUpdate,
  onDecoratorUpdate,
  onAddCertification,
  onRemoveCertification,
  onCertificationError,
  onSocialLinkUpdate,
}) {
  const fileInputRef = useRef(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showDecoratorSelector, setShowDecoratorSelector] = useState(false);

  const handleAvatarClick = () => {
    if (isOwnProfile && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      const avatarUrl = await uploadAvatarToS3(file);

      // Notificar al padre para que actualice el perfil
      if (onAvatarUpdate) {
        await onAvatarUpdate(avatarUrl);
      }
    } catch (error) {
      console.error('Error subiendo avatar:', error);
      alert(error.message || 'Error al subir el avatar');
    } finally {
      setUploadingAvatar(false);
      // Limpiar el input para permitir subir el mismo archivo
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="profile-hero">
      {/* Columna izquierda - Avatar y contacto */}
      <div className="profile-hero-left">
        <div className={`avatar-wrapper ${isOwnProfile ? 'editable' : ''}`} onClick={handleAvatarClick}>
          <DecoratedAvatar decoratorId={profile.avatarDecorator || 'none'} size="xlarge">
            <Avatar
              src={profile.avatar || ''}
              alt={profile.username}
              size="xlarge"
            />
          </DecoratedAvatar>
          {isOwnProfile && (
            <div className={`avatar-overlay ${uploadingAvatar ? 'uploading' : ''}`}>
              {uploadingAvatar ? (
                <span className="avatar-spinner">⏳</span>
              ) : (
                <span className="avatar-edit-icon">📷</span>
              )}
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>
        <h2 className="profile-username">{profile.username}</h2>



        {/* Botón para cambiar decorador - solo si es tu perfil */}
        {isOwnProfile && (
          <Button
            variant="secondary"
            size="small"
            onClick={() => setShowDecoratorSelector(!showDecoratorSelector)}
            style={{ marginTop: '0.5rem' }}
          >
            {showDecoratorSelector ? 'Cerrar decoradores' : '✨ Decoradores'}
          </Button>
        )}

        {/* Selector de decoradores (modal) */}
        {isOwnProfile && showDecoratorSelector && (
          <DecoratorSelector
            currentDecorator={profile.avatarDecorator || 'none'}
            ownedDecorators={['none', 'green_ring', 'neon_ring', 'animated_ring', 'lightning_ring', 'lava_ring']}
            avatarUrl={profile.avatar || ''}
            onSelect={(decoratorId) => {
              onDecoratorUpdate(decoratorId);
              setShowDecoratorSelector(false);
            }}
            onClose={() => setShowDecoratorSelector(false)}
            saving={saving}
          />
        )}

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
          <SocialLinkEditor
            network="spotify"
            value={formData.contact?.social_media?.spotify || ''}
            isOwnProfile={isOwnProfile}
            onUpdate={onSocialLinkUpdate}
          />
          <SocialLinkEditor
            network="soundcloud"
            value={formData.contact?.social_media?.soundcloud || ''}
            isOwnProfile={isOwnProfile}
            onUpdate={onSocialLinkUpdate}
          />
        </div>
      </div>

      {/* Columna central - Nombre + About Me + Beats */}
      <div className="profile-hero-center">
        {/* Header con nombre */}
        <div className="profile-name-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 className="profile-fullname">{formData.full_name || profile.username}</h1>
            {profile.identityVerified && (
              <BadgeCheck
                size={28}
                className="verified-badge"
                fill="#3b82f6"
                color="white"
                aria-label="Perfil verificado"
                title="Perfil verificado"
              />
            )}
          </div>
          {isOwnProfile && !isEditingBasic && (
            <Button variant="secondary" onClick={onEditClick}>
              Editar perfil
            </Button>
          )}
        </div>

        {/* About Me */}
        <div
          className={`profile-about-section ${isOwnProfile && !isEditingAbout ? 'clickable' : ''}`}
          onClick={() => {
            if (isOwnProfile && !isEditingAbout) {
              onEditAboutClick();
            }
          }}
          title={isOwnProfile && !isEditingAbout ? "Click para editar" : ""}
        >
          <textarea
            name="about_me"
            value={formData.about_me}
            onChange={onInputChange}
            disabled={!isEditingAbout || !isOwnProfile}
            className={`profile-textarea ${(!isEditingAbout || !isOwnProfile) ? 'disabled' : ''}`}
            placeholder={isOwnProfile ? "Cuéntanos sobre ti, tu experiencia..." : "Sin descripción"}
            maxLength={MAX_ABOUT_ME_LENGTH}
            rows={5}
            onClick={(e) => {
              if (isEditingAbout) {
                e.stopPropagation();
              }
            }}
          />
          {isEditingAbout && isOwnProfile && (
            <div className="about-edit-controls">
              <span className="character-count">{formData.about_me.length}/{MAX_ABOUT_ME_LENGTH}</span>
              <div className="about-buttons">
                <Button
                  type="button"
                  variant="secondary"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCancelAbout();
                  }}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSubmitAbout(e);
                  }}
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </Button>
              </div>
            </div>
          )}
        </div>


      </div>

      {/* Columna derecha - Certificaciones */}
      <div className="profile-hero-right">
        <ProfileCertifications
          certifications={profile.certifications || []}
          isOwnProfile={isOwnProfile}
          onAddCertification={onAddCertification}
          onRemoveCertification={onRemoveCertification}
          onError={onCertificationError}
          saving={saving}
        />
      </div>
    </div>
  );
}
