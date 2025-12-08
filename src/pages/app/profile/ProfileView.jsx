import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProfileData } from '@/hooks/use-profile-data';
import { useProfileForm } from '@/hooks/use-profile-form';
import Button from '@/components/ui/Button';
import SuccessModal from '@/components/ui/SuccessModal';
import ErrorModal from '@/components/ui/ErrorModal';
import ProfileHero from '@/components/profile/ProfileHero';
import ProfileEditForm from '@/components/profile/ProfileEditForm';
import ProfileSkillsSection from '@/components/profile/ProfileSkillsSection';
import './Profile.css';

const MAX_TAGS = 20;
const MAX_ABOUT_ME_LENGTH = 500;

export default function ProfileView() {
  const { username } = useParams();
  const navigate = useNavigate();
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Use custom hooks for data and form management
  const handleRedirect = () => {
    navigate('/app/profile', { replace: true });
  };

  const { profile, loading, error, isOwnProfile, loadProfile } = useProfileData(username, handleRedirect);
  
  const handleSuccess = async () => {
    setShowSuccessModal(true);
    await loadProfile();
  };

  const {
    formData,
    isEditingBasic,
    isEditingAbout,
    isEditingTags,
    saving,
    tagInput,
    setTagInput,
    setIsEditingBasic,
    setIsEditingAbout,
    setIsEditingTags,
    handleInputChange,
    handleContactChange,
    handleAddTag,
    handleRemoveTag,
    handleSubmitBasic,
    handleSubmitAbout,
    handleSubmitTags,
    handleCancelBasic,
    handleCancelAbout,
    handleCancelTags,
  } = useProfileForm(profile, isOwnProfile, handleSuccess);

  // Handle form submission errors
  const handleBasicSubmit = async (e) => {
    try {
      await handleSubmitBasic(e);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Error al actualizar el perfil');
      setShowErrorModal(true);
    }
  };

  const handleAboutSubmit = async (e) => {
    try {
      await handleSubmitAbout(e);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Error al actualizar descripción');
      setShowErrorModal(true);
    }
  };

  const handleTagsSubmit = async (e) => {
    try {
      await handleSubmitTags(e);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Error al actualizar las aptitudes');
      setShowErrorModal(true);
    }
  };

  // Show error from useProfileData
  useEffect(() => {
    if (error) {
      setErrorMessage(error);
      setShowErrorModal(true);
    }
  }, [error]);

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
      {/* Hero Section */}
      <ProfileHero
        profile={profile}
        formData={formData}
        isOwnProfile={isOwnProfile}
        isEditingBasic={isEditingBasic}
        isEditingAbout={isEditingAbout}
        saving={saving}
        onEditClick={() => setIsEditingBasic(true)}
        onEditAboutClick={() => setIsEditingAbout(true)}
        onInputChange={handleInputChange}
        onSubmitAbout={handleAboutSubmit}
        onCancelAbout={handleCancelAbout}
      />

      {/* Edit Form - only if own profile */}
      {isOwnProfile && isEditingBasic && (
        <ProfileEditForm
          formData={formData}
          saving={saving}
          onInputChange={handleInputChange}
          onContactChange={handleContactChange}
          onSubmit={handleBasicSubmit}
          onCancel={handleCancelBasic}
        />
      )}

      {/* Estudios Section */}
      <div className="profile-section-block">
        <h2>Estudios</h2>
        <p className="mocked-text">Aquí podrás añadir tu formación académica, similar a LinkedIn. Próximamente disponible.</p>
      </div>

      {/* Skills Section */}
      <ProfileSkillsSection
        formData={formData}
        isOwnProfile={isOwnProfile}
        isEditingTags={isEditingTags}
        saving={saving}
        tagInput={tagInput}
        onTagInputChange={(e) => setTagInput(e.target.value)}
        onEditClick={() => setIsEditingTags(true)}
        onAddTag={handleAddTag}
        onRemoveTag={handleRemoveTag}
        onSubmit={handleTagsSubmit}
        onCancel={handleCancelTags}
      />

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


