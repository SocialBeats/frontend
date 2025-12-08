import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { MAX_ABOUT_ME_LENGTH } from '@/pages/app/profile/ProfileView';

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
}) {
  return (
    <div className="profile-hero">
      {/* Columna izquierda - Avatar y contacto */}
      <div className="profile-hero-left">
        <Avatar
          src={profile.avatar || ''}
          alt={profile.username}
          size="xlarge"
        />
        <h2 className="profile-username">{profile.username}</h2>

        {/* Badge de completitud - solo si es tu perfil */}
        {isOwnProfile && (
          <div className="profile-completion">
            <Badge variant="warning">Completa tu perfil</Badge>
          </div>
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
  );
}
