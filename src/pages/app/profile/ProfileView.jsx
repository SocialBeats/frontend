import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProfileData } from '@/hooks/use-profile-data';
import { useProfileForm } from '@/hooks/use-profile-form';
import { useProfileContext } from '@/contexts/ProfileContext';
import { updateMyProfile } from '@/services/profileService';
import Button from '@/components/ui/Button';
import SuccessModal from '@/components/ui/SuccessModal';
import ErrorModal from '@/components/ui/ErrorModal';
import ProfileHero from '@/components/profile/ProfileHero';
import ProfileEditForm from '@/components/profile/ProfileEditForm';
import ProfileSkillsSection from '@/components/profile/ProfileSkillsSection';
import ProfileStudiesSection from '@/components/profile/ProfileStudiesSection';
import ProfileCompletionWidget from '@/components/profile/ProfileCompletionWidget';
import './Profile.css';

export const MAX_TAGS = 20;
export const MAX_ABOUT_ME_LENGTH = 500;

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
  const { notifyProfileUpdate } = useProfileContext();
  

  const handleSuccess = async () => {
    // Solo recargar perfil sin mostrar modal (más fluido)
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
    handleSubmitStudies,
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

  const handleAvatarUpdate = async (avatarUrl) => {
    try {
      await updateMyProfile({ avatar: avatarUrl });
      await loadProfile(); // Recargar el perfil para mostrar el nuevo avatar
      notifyProfileUpdate(); // Notificar a NavBar y otros componentes
      setShowSuccessModal(true);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Error al actualizar el avatar');
      setShowErrorModal(true);
      throw error; // Re-throw para que ProfileHero maneje el estado
    }
  };

  // Handlers para certificaciones
  const handleAddCertification = async (certification) => {
    try {
      const currentCerts = profile.certifications || [];
      const newCerts = [...currentCerts, certification];
      await updateMyProfile({ certifications: newCerts });
      await loadProfile();
      setShowSuccessModal(true);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Error al añadir certificación');
      setShowErrorModal(true);
      throw error;
    }
  };

  const handleRemoveCertification = async (index) => {
    try {
      const currentCerts = profile.certifications || [];
      const newCerts = currentCerts.filter((_, i) => i !== index);
      await updateMyProfile({ certifications: newCerts });
      await loadProfile();
      setShowSuccessModal(true);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Error al eliminar certificación');
      setShowErrorModal(true);
      throw error;
    }
  };

  const handleStudiesSubmit = async (updatedStudies) => {
    try {
      await handleSubmitStudies(updatedStudies);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Error al actualizar los estudios');
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
      {/* Profile Completion Widget - only for own profile */}
      {isOwnProfile && (
        <ProfileCompletionWidget
          onEditBasic={() => setIsEditingBasic(true)}
          onEditAbout={() => setIsEditingAbout(true)}
          onEditTags={() => setIsEditingTags(true)}
        />
      )}

      {/* Hero Section */}
      <div id="profile-hero">
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
        onAvatarUpdate={handleAvatarUpdate}
        onAddCertification={handleAddCertification}
        onRemoveCertification={handleRemoveCertification}
        onCertificationError={(message) => {
          setErrorMessage(message);
          setShowErrorModal(true);
        }}
      />
      </div>

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

      {/* Studies Section */}
      <div id="profile-studies-section">
        <ProfileStudiesSection
          studies={formData.studies}
          isOwnProfile={isOwnProfile}
          onUpdateStudies={handleStudiesSubmit}
        />
      </div>

      {/* Skills Section */}
      <div id="profile-skills-section">
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
