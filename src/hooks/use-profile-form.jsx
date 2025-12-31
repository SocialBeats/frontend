import { useState, useEffect } from 'react';
import { updateMyProfile } from '@/services/profileService';

/**
 * Custom hook for managing profile form state and operations
 * @param {Object} profile - The profile data
 * @param {boolean} isOwnProfile - Whether the profile belongs to the current user
 * @param {function} onSuccess - Callback to execute on successful update
 * @returns {Object} Form data, handlers, and state
 */
export const useProfileForm = (profile, isOwnProfile = true, onSuccess = null) => {
  const [isEditingBasic, setIsEditingBasic] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');

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
    studies: [],
  });

  // Initialize form data when profile changes
  useEffect(() => {
    if (profile) {
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
        studies: profile.studies || [],
      });
    }
  }, [profile]);

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
    if (tagInput.trim() && formData.tags.length < 20) {
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
    if (!isOwnProfile) return;

    try {
      setSaving(true);
      await updateMyProfile(formData);
      setIsEditingBasic(false);
      if (onSuccess) {
        await onSuccess();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitAbout = async (e) => {
    e.preventDefault();
    if (!isOwnProfile) return;

    try {
      setSaving(true);
      await updateMyProfile({ about_me: formData.about_me });
      setIsEditingAbout(false);
      if (onSuccess) {
        await onSuccess();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitTags = async (e) => {
    e.preventDefault();
    if (!isOwnProfile) return;

    try {
      setSaving(true);
      await updateMyProfile({ tags: formData.tags });
      setIsEditingTags(false);
      if (onSuccess) {
        await onSuccess();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitStudies = async (updatedStudies) => {
    if (!isOwnProfile) return;

    try {
      setSaving(true);
      await updateMyProfile({ studies: updatedStudies });
      setFormData(prev => ({ ...prev, studies: updatedStudies }));

      if (onSuccess) {
        await onSuccess();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancelBasic = () => {
    setIsEditingBasic(false);
    if (profile) {
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
    }
  };

  const handleCancelAbout = () => {
    setIsEditingAbout(false);
    if (profile) {
      setFormData(prev => ({
        ...prev,
        about_me: profile.about_me || '',
      }));
    }
  };

  const handleCancelTags = () => {
    setIsEditingTags(false);
    if (profile) {
      setFormData(prev => ({
        ...prev,
        tags: profile.tags || [],
      }));
    }
    setTagInput('');
  };

  /**
   * Updates a specific social media link in the local form state
   * @param {string} network - The social network key (e.g., 'spotify', 'soundcloud')
   * @param {string} value - The new URL value
   */
  const handleSocialLinkUpdate = (network, value) => {
    setFormData(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        social_media: {
          ...(prev.contact?.social_media || {}),
          [network]: value,
        },
      },
    }));
  };

  return {
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
    handleSubmitStudies,
    handleCancelBasic,
    handleCancelAbout,
    handleCancelTags,
    handleSocialLinkUpdate,
  };
};
