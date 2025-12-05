import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Waveform from '../ui/Waveform';
import './BeatForm.css';

const BeatForm = ({ 
  initialData = null, 
  onSubmit, 
  onCancel, 
  loading = false,
  isEditing = false 
}) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    genre: initialData?.genre || '',
    key: initialData?.key || '',
    description: initialData?.description || '',
    tags: initialData?.tags || [],
    pricing: {
      isFree: initialData?.pricing?.isFree ?? true,
      price: initialData?.pricing?.price?.toString() || '0',
      currency: initialData?.pricing?.currency || 'USD'
    },
    isPublic: initialData?.isPublic ?? true,
    isDownloadable: initialData?.isDownloadable ?? false,
  });

  const [tagInput, setTagInput] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState(
    initialData?.audio?.s3Key 
      ? `${import.meta.env.VITE_CDN_DOMAIN}/${initialData.audio.s3Key}` 
      : null
  );
  const [error, setError] = useState(null);

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
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim().toLowerCase())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim().toLowerCase()]
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/flac', 'audio/aac', 'audio/x-m4a'];
    const validExtensions = ['mp3', 'wav', 'flac', 'aac'];
    const fileExtension = file.name.split('.').pop().toLowerCase();

    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      setError('Invalid file type. Allowed: MP3, WAV, FLAC, AAC');
      return;
    }

    // Validate size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      setError('File size too large. Maximum size is 50MB.');
      return;
    }

    setAudioFile(file);
    setAudioPreviewUrl(URL.createObjectURL(file));

    // Auto-fill title if empty
    if (!formData.title) {
      const fileNameWithoutExt = file.name.split('.').slice(0, -1).join('.');
      setFormData(prev => ({ ...prev, title: fileNameWithoutExt }));
    }

    setError(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    if (!isEditing && !audioFile) {
      setError('Please upload an audio file.');
      return;
    }

    // Prepare data
    const submitData = {
      ...formData,
      pricing: {
        ...formData.pricing,
        // If not downloadable, always free
        isFree: !formData.isDownloadable ? true : formData.pricing.isFree,
        price: (!formData.isDownloadable || formData.pricing.isFree) ? 0 : parseFloat(formData.pricing.price) || 0
      }
    };

    onSubmit(submitData, audioFile);
  };

  return (
    <form onSubmit={handleSubmit} className="beat-form">
      {error && (
        <Card className="error-card">
          <p className="error-message">{error}</p>
        </Card>
      )}

      <div className="form-grid">
        {/* Audio Upload Section - Only for creation */}
        {!isEditing && (
          <Card className="form-section">
            <div className="section-header">
              <h2>Audio File</h2>
              <p className="section-description">Upload your beat (MP3, WAV, FLAC, AAC - max 50MB)</p>
            </div>

            <div className="form-fields">
              <div className="upload-container">
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    id="audio-upload"
                    accept=".mp3,.wav,.flac,.aac"
                    onChange={handleFileChange}
                    className="file-input"
                  />
                  <label htmlFor="audio-upload" className="file-input-label">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => document.getElementById('audio-upload').click()}
                    >
                      {audioFile ? 'Change File' : 'Select Audio File'}
                    </Button>
                    <span className="file-name">
                      {audioFile ? audioFile.name : 'No file selected'}
                    </span>
                  </label>
                </div>

                {audioPreviewUrl && (
                  <div className="waveform-preview mt-4">
                    <Waveform url={audioPreviewUrl} height={80} />
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Audio Info - Only when editing */}
        {isEditing && initialData?.audio && (
          <Card className="form-section">
            <div className="section-header">
              <h2>Audio File</h2>
              <p className="section-description text-muted">Audio files cannot be modified after creation</p>
            </div>

            <div className="form-fields">
              <div className="audio-info">
                <div className="audio-info-item">
                  <span className="label">Filename:</span>
                  <span className="value">{initialData.audio.filename}</span>
                </div>
                <div className="audio-info-item">
                  <span className="label">Format:</span>
                  <span className="value">{initialData.audio.format.toUpperCase()}</span>
                </div>
                <div className="audio-info-item">
                  <span className="label">Size:</span>
                  <span className="value">{(initialData.audio.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              </div>

              {audioPreviewUrl && (
                <div className="waveform-preview mt-4">
                  <Waveform url={audioPreviewUrl} height={80} />
                </div>
              )}
            </div>
          </Card>
        )}

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
                maxLength={100}
                required
              />
            </div>

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
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your beat..."
                maxLength={500}
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
          </div>
        </Card>

        {/* Tags */}
        <Card className="form-section">
          <div className="section-header">
            <h2>Tags</h2>
            <p className="section-description">Add tags to help users discover your beat</p>
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

        {/* Visibility & Pricing */}
        <Card className="form-section">
          <div className="section-header">
            <h2>Visibility & Pricing</h2>
          </div>

          <div className="form-fields">
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={handleInputChange}
                />
                <span className="checkbox-text">Public (visible to everyone)</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isDownloadable"
                  checked={formData.isDownloadable}
                  onChange={handleInputChange}
                />
                <span className="checkbox-text">Allow downloads</span>
              </label>
            </div>

            {/* Pricing options only if downloadable */}
            {formData.isDownloadable && (
              <>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="pricing.isFree"
                      checked={formData.pricing.isFree}
                      onChange={handleInputChange}
                    />
                    <span className="checkbox-text">Free download</span>
                  </label>
                </div>

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
                        value={formData.pricing.currency}
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
              </>
            )}
          </div>
        </Card>
      </div>

      {/* Submit Buttons */}
      <div className="form-actions">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          variant="primary"
          disabled={loading || !formData.title || !formData.genre || (!isEditing && !audioFile)}
          className="submit-button"
        >
          {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Beat' : 'Create Beat')}
        </Button>
      </div>
    </form>
  );
};

export default BeatForm;
