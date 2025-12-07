import React, { useState } from 'react';
import { parseBlob } from 'music-metadata';
import {
  UploadCloud,
  Music,
  X,
  Save,
  FileAudio,
  Type,
  Music2,
  Binary,
  AlignLeft,
  Hash,
  Eye,
  DollarSign
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import IconButton from '../ui/IconButton';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
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
  const [audioFile, setAudioFile] = useState(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState(
    initialData?.audio?.s3Key
      ? `${import.meta.env.VITE_CDN_DOMAIN}/${initialData.audio.s3Key}`
      : null
  );
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState(null);

  const [tagInput, setTagInput] = useState('');

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

  const validateAndProcessFile = async (file) => {
    if (!file) return false;

    // Validate file type
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/flac', 'audio/aac', 'audio/x-m4a'];
    const validExtensions = ['mp3', 'wav', 'flac', 'aac'];
    const fileExtension = file.name.split('.').pop().toLowerCase();

    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      setError('Invalid file type. Allowed: MP3, WAV, FLAC, AAC');
      return false;
    }

    // Validate size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      setError('File size too large. Maximum size is 50MB.');
      return false;
    }

    try {
      // Deep validation using music-metadata
      const metadata = await parseBlob(file);
      if (!metadata.format.codec) {
        setError('Invalid audio file content. Please upload a valid audio file.');
        return false;
      }
    } catch (err) {
      console.error('Error parsing audio file:', err);
      setError('Failed to verify audio file. Is it a valid audio file?');
      return false;
    }

    setAudioFile(file);
    setAudioPreviewUrl(URL.createObjectURL(file));

    // Auto-fill title if empty
    if (!formData.title) {
      const fileNameWithoutExt = file.name.split('.').slice(0, -1).join('.');
      setFormData(prev => ({ ...prev, title: fileNameWithoutExt }));
    }

    setError(null);
    return true;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    await validateAndProcessFile(file);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await validateAndProcessFile(files[0]);
    }
  };

  const handleClearFile = () => {
    setAudioFile(null);
    setAudioPreviewUrl(null);
    setError(null);
    // Reset file input
    const fileInput = document.getElementById('audio-upload');
    if (fileInput) {
      fileInput.value = '';
    }
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
            <div className="section-header-with-icon">
              <Music size={24} className="section-icon" />
              <div className="section-header-text">
                <h2>Audio File</h2>
                <p className="section-description">
                  Upload your beat (MP3, WAV, FLAC, AAC - max 50MB)
                </p>
              </div>
            </div>

            <div className="form-fields">
              <div className="upload-container">
                <input
                  type="file"
                  id="audio-upload"
                  accept=".mp3,.wav,.flac,.aac"
                  onChange={handleFileChange}
                  className="file-input"
                />

                {!audioFile ? (
                  <div
                    className={`audio-dropzone audio-dropzone-empty ${isDragActive ? 'audio-dropzone-active' : ''}`}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('audio-upload').click()}
                  >
                    <div className="dropzone-content">
                      <UploadCloud size={48} className="dropzone-icon" />
                      <h3 className="dropzone-title">Drop your beat here</h3>
                      <p className="dropzone-description">
                        or click to browse files
                      </p>
                      <p className="dropzone-formats">
                        MP3, WAV, FLAC, AAC • Max 50MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="audio-dropzone audio-dropzone-loaded">
                    <div className="audio-file-info">
                      <FileAudio size={24} className="file-icon" />
                      <div className="file-details">
                        <p className="file-name-loaded">{audioFile.name}</p>
                        <p className="file-size">
                          {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <IconButton
                      variant="ghost"
                      size="medium"
                      onClick={handleClearFile}
                      className="file-remove-btn"
                      aria-label="Remove file"
                    >
                      <X size={20} />
                    </IconButton>
                  </div>
                )}

                {audioPreviewUrl && (
                  <div className="waveform-preview mt-4">
                    <Waveform url={audioPreviewUrl} height={80} />
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Beat Metadata - Unified Section */}
        <Card className="form-section">
          <div className="section-header-with-icon">
            <Music size={24} className="section-icon" />
            <div className="section-header-text">
              <h2>Beat Information</h2>
              <p className="section-description">
                Add details about your beat
              </p>
            </div>
          </div>

          <div className="form-fields">
            {/* Title - Full Width */}
            <div className="field-group">
              <Input
                label="Title"
                icon={<Type size={16} />}
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter beat title"
                fullWidth
                required
              />
            </div>

            {/* Genre and Key - Grid Row */}
            <div className="field-row">
              <div className="field-group">
                <Select
                  label="Genre"
                  icon={<Music2 size={16} />}
                  name="genre"
                  value={formData.genre}
                  onChange={handleInputChange}
                  fullWidth
                  required
                >
                  <option value="">Select genre</option>
                  <option value="Hip Hop">Hip Hop</option>
                  <option value="Trap">Trap</option>
                  <option value="R&B">R&B</option>
                  <option value="Pop">Pop</option>
                  <option value="Electronic">Electronic</option>
                  <option value="Rock">Rock</option>
                  <option value="Jazz">Jazz</option>
                  <option value="Lo-Fi">Lo-Fi</option>
                  <option value="Drill">Drill</option>
                  <option value="Other">Other</option>
                </Select>
              </div>

              <div className="field-group">
                <Select
                  label="Key"
                  icon={<Binary size={16} />}
                  name="key"
                  value={formData.key}
                  onChange={handleInputChange}
                  fullWidth
                >
                  <option value="">Select key</option>
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
                  <option value="Cm">Cm</option>
                  <option value="C#m">C#m</option>
                  <option value="Dm">Dm</option>
                  <option value="D#m">D#m</option>
                  <option value="Em">Em</option>
                  <option value="Fm">Fm</option>
                  <option value="F#m">F#m</option>
                  <option value="Gm">Gm</option>
                  <option value="G#m">G#m</option>
                  <option value="Am">Am</option>
                  <option value="A#m">A#m</option>
                  <option value="Bm">Bm</option>
                </Select>
              </div>
            </div>

            {/* Description - Full Width */}
            <div className="field-group">
              <Textarea
                label="Description"
                icon={<AlignLeft size={16} />}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your beat, its vibe, and intended use..."
                fullWidth
                rows={4}
              />
            </div>

            {/* Tags Section */}
            <div className="field-group">
              <label className="input-label">
                <Hash size={16} className="label-icon" />
                Tags
              </label>

              <div className="tag-input-section">
                <div className="tag-input-group">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add tag..."
                    fullWidth
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
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
                        aria-label={`Remove ${tag}`}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
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
                <Eye size={16} style={{ marginLeft: '0.5rem', color: 'var(--text-muted)' }} />
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
                    <DollarSign size={16} style={{ marginLeft: '0.5rem', color: 'var(--text-muted)' }} />
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
                      <Select
                        id="pricing.currency"
                        name="pricing.currency"
                        value={formData.pricing.currency}
                        onChange={handleInputChange}
                        fullWidth
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                      </Select>
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
          className="submit-button gap-2"
        >
          <Save size={18} />
          {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Beat' : 'Create Beat')}
        </Button>
      </div>
    </form>
  );
};

export default BeatForm;
