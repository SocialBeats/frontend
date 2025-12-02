import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import IconButton from '../../../components/ui/IconButton';
import { createBeat, updateBeat, getBeatById } from '../../../services/beatsService';
import './BeatFormPage.css';

const BeatFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    genre: '',
    bpm: '',
    key: '',
    duration: '',
    description: '',
    tags: [],
    mood: '',
    license: 'Lease',
    audio: {
      format: ''
    },
    pricing: {
      isFree: false,
      price: '',
      currency: 'USD'
    }
  });
  
  const [tagInput, setTagInput] = useState('');

  // Load beat data for editing
  useEffect(() => {
    if (isEditing) {
      const loadBeat = async () => {
        try {
          const beat = await getBeatById(id);
          setFormData({
            title: beat.title || '',
            artist: beat.artist || '',
            genre: beat.genre || '',
            bpm: beat.bpm?.toString() || '',
            key: beat.key || '',
            duration: beat.duration?.toString() || '',
            description: beat.description || '',
            tags: beat.tags || [],
            mood: beat.mood || '',
            license: beat.license || 'Lease',
            audio: {
              url: beat.audio?.url || '',
              filename: beat.audio?.filename || '',
              size: beat.audio?.size || '',
              format: beat.audio?.format || ''
            },
            pricing: {
              isFree: beat.pricing?.isFree || false,
              price: beat.pricing?.price?.toString() || '',
              currency: beat.pricing?.currency || 'USD'
            }
          });
        } catch (err) {
          setError('Error loading beat data');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      loadBeat();
    }
  }, [id, isEditing]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('pricing.')) {
      const pricingField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        pricing: {
          ...prev.pricing,
          [pricingField]: type === 'checkbox' ? checked : value
        }
      }));
    } else if (name.startsWith('audio.')) {
      const audioField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        audio: {
          ...prev.audio,
          [audioField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // Prepare data for API
      const beatData = {
        ...formData,
        bpm: formData.bpm ? parseInt(formData.bpm) : undefined,
        duration: formData.duration ? parseInt(formData.duration) : undefined,
        pricing: {
          ...formData.pricing,
          price: formData.pricing.isFree ? 0 : parseFloat(formData.pricing.price) || 0
        }
      };

      let result;
      if (isEditing) {
        await updateBeat(id, beatData);
        navigate(-1);
      } else {
        result = await createBeat(beatData);
        navigate(`/app/beats/${result._id || result.id}`, { replace: true });
      }
    } catch (err) {
      setError(`Error ${isEditing ? 'updating' : 'creating'} beat. Please try again.`);
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="beat-form-loading">
        <div className="text-xl text-muted">Loading beat data...</div>
      </div>
    );
  }

  return (
    <div className="beat-form-page">
      {/* Header */}
      <div className="beat-form-header">
        <button onClick={() => navigate(-1)} className="back-button">
          <IconButton variant="ghost" size="medium">
            ← Back
          </IconButton>
        </button>
        <h1 className="beat-form-title">
          {isEditing ? 'Edit Beat' : 'Create New Beat'}
        </h1>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="error-card">
          <p className="error-message">{error}</p>
        </Card>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="beat-form">
        <div className="form-grid">
          {/* Basic Information */}
          <Card className="form-section">
            <div className="section-header">
              <h2>Basic Information</h2>
            </div>
            
            <div className="form-fields">
              <div className="field-group">
                <label htmlFor="title">Title *</label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter beat title"
                  required
                />
              </div>

              <div className="field-group">
                <label htmlFor="artist">Artist *</label>
                <Input
                  id="artist"
                  name="artist"
                  value={formData.artist}
                  onChange={handleInputChange}
                  placeholder="Enter artist name"
                  required
                />
              </div>

              <div className="field-row">
                <div className="field-group">
                  <label htmlFor="genre">Genre *</label>
                  <select
                    id="genre"
                    name="genre"
                    value={formData.genre}
                    onChange={handleInputChange}
                    className="genre-select"
                    required
                  >
                    <option value="">Select a genre</option>
                    <option value="Hip Hop">Hip Hop</option>
                    <option value="Trap">Trap</option>
                    <option value="R&B">R&B</option>
                    <option value="Pop">Pop</option>
                    <option value="Rock">Rock</option>
                    <option value="Electronic">Electronic</option>
                    <option value="Jazz">Jazz</option>
                    <option value="Reggaeton">Reggaeton</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="field-group">
                  <label htmlFor="mood">Mood</label>
                  <Input
                    id="mood"
                    name="mood"
                    value={formData.mood}
                    onChange={handleInputChange}
                    placeholder="e.g., Happy, Dark, Chill"
                  />
                </div>
              </div>

              <div className="field-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your beat..."
                  rows="4"
                  className="description-textarea"
                />
              </div>
            </div>
          </Card>

          {/* Technical Details */}
          <Card className="form-section">
            <div className="section-header">
              <h2>Technical Details</h2>
            </div>
            
            <div className="form-fields">
              <div className="field-row">
                <div className="field-group">
                  <label htmlFor="bpm">BPM</label>
                  <Input
                    id="bpm"
                    name="bpm"
                    type="number"
                    value={formData.bpm}
                    onChange={handleInputChange}
                    placeholder="120"
                    min="60"
                    max="200"
                  />
                </div>

                <div className="field-group">
                  <label htmlFor="key">Key</label>
                  <select
                    id="key"
                    name="key"
                    value={formData.key}
                    onChange={handleInputChange}
                    className="key-select"
                  >
                    <option value="">Select a key</option>
                    <option value="C">C</option>
                    <option value="C#">C#</option>
                    <option value="D">D</option>
                    <option value="D#">D#</option>
                    <option value="E">E</option>
                    <option value="F">F</option>
                    <option value="F#">F#</option>
                    <option value="G">G</option>
                    <option value="G#">G#</option>
                    <option value="A">A</option>
                    <option value="A#">A#</option>
                    <option value="B">B</option>
                  </select>
                </div>

                <div className="field-group">
                  <label htmlFor="duration">Duration (seconds)</label>
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="180"
                    min="30"
                    max="600"
                  />
                </div>
              </div>

              <div className="field-row">
                <div className="field-group">
                  <label htmlFor="audioFormat">Audio Format *</label>
                  <select
                    id="audioFormat"
                    name="audio.format"
                    value={formData.audio?.format || ''}
                    onChange={handleInputChange}
                    className="audio-format-select"
                    required
                  >
                    <option value="">Select format</option>
                    <option value="mp3">MP3</option>
                    <option value="wav">WAV</option>
                    <option value="flac">FLAC</option>
                    <option value="aac">AAC</option>
                  </select>
                </div>

                <div className="field-group">
                  <label htmlFor="license">License Type</label>
                  <select
                    id="license"
                    name="license"
                    value={formData.license}
                    onChange={handleInputChange}
                    className="license-select"
                  >
                    <option value="Lease">Lease</option>
                    <option value="Exclusive">Exclusive</option>
                    <option value="Free">Free</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Tags */}
          <Card className="form-section">
            <div className="section-header">
              <h2>Tags</h2>
            </div>
            
            <div className="form-fields">
              <div className="tag-input-section">
                <div className="tag-input-group">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add tag..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  />
                  <Button type="button" onClick={handleAddTag} variant="outline">
                    Add
                  </Button>
                </div>
                
                <div className="tags-display">
                  {formData.tags.map((tag, index) => (
                    <div key={tag} className="tag-chip" style={{ '--tag-index': index }}>
                      <span className="tag-text">#{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="tag-remove"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Pricing */}
          <Card className="form-section">
            <div className="section-header">
              <h2>Pricing</h2>
            </div>
            
            <div className="form-fields">
              <div className="pricing-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="pricing.isFree"
                    checked={formData.pricing.isFree}
                    onChange={handleInputChange}
                  />
                  <span className="checkbox-text">Free Beat</span>
                </label>

                {!formData.pricing.isFree && (
                  <div className="field-row">
                    <div className="field-group">
                      <label htmlFor="pricing.price">Price</label>
                      <Input
                        id="pricing.price"
                        name="pricing.price"
                        type="number"
                        value={formData.pricing.price}
                        onChange={handleInputChange}
                        placeholder="29.99"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    
                    <div className="field-group">
                      <label htmlFor="pricing.currency">Currency</label>
                      <select
                        id="pricing.currency"
                        name="pricing.currency"
                        value={formData.pricing.currency || 'USD'}
                        onChange={handleInputChange}
                        className="currency-select"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Submit Buttons */}
        <div className="form-actions">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={saving}
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            variant="primary"
            disabled={saving || !formData.title || !formData.artist}
            className="submit-button"
          >
            {saving ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Beat' : 'Create Beat')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BeatFormPage;