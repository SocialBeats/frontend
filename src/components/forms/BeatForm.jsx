import React, { useState, useRef, useEffect } from 'react';
import { parseBlob } from 'music-metadata';
import {
  Music,
  Save,
  Type,
  Music2,
  Binary,
  AlignLeft,
  Hash,
  Eye,
  DollarSign,
  FileText,
  Download,
  Image,
  X // Used in tags
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import Toggle from '../ui/Toggle';
import FileUploader from '../ui/FileUploader';
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
    isPublic: initialData?.isPublic ?? true,
    isDownloadable: initialData?.isDownloadable ?? false,
  });
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  // Helper to resolve cover URL safely
  const getCoverUrl = (data) => {
    if (!data?.audio) return null;
    if (data.audio.coverUrl) return data.audio.coverUrl;
    if (data.audio.s3CoverKey) {
      const domain = window.RUNTIME_CONFIG?.VITE_CDN_DOMAIN || '';
      const key = data.audio.s3CoverKey.startsWith('/')
        ? data.audio.s3CoverKey.slice(1)
        : data.audio.s3CoverKey;
      return `${domain}/${key}`;
    }
    return null;
  };

  const [coverPreviewUrl, setCoverPreviewUrl] = useState(getCoverUrl(initialData));

  // Sync state with initialData if it changes (async load)
  useEffect(() => {
    if (initialData) {
      console.log('BeatForm received initialData:', initialData);
      setFormData({
        title: initialData.title || '',
        genre: initialData.genre || '',
        key: initialData.key || '',
        description: initialData.description || '',
        tags: initialData.tags || [],
        isPublic: initialData.isPublic ?? true,
        isDownloadable: initialData.isDownloadable ?? false,
      });

      const derivedCoverUrl = getCoverUrl(initialData);
      console.log('Derived Cover URL:', derivedCoverUrl);
      setCoverPreviewUrl(derivedCoverUrl);
    }
  }, [initialData]);

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
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/flac', 'audio/aac', 'audio/x-m4a'];
    const validExtensions = ['mp3', 'wav', 'flac', 'aac'];
    const fileExtension = file.name.split('.').pop().toLowerCase();

    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      setError('Invalid file type. Allowed: MP3, WAV, FLAC, AAC');
      return false;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError('File size too large. Maximum size is 50MB.');
      return false;
    }
    try {
      const metadata = await parseBlob(file);
      if (!metadata.format.codec) {
        setError('Invalid audio file content.');
        return false;
      }
    } catch (err) {
      console.error('Error parsing audio file:', err);
      setError('Failed to verify audio file.');
      return false;
    }

    setAudioFile(file);

    if (!formData.title) {
      const fileNameWithoutExt = file.name.split('.').slice(0, -1).join('.');
      setFormData(prev => ({ ...prev, title: fileNameWithoutExt }));
    }
    setError(null);
    return true;
  };

  const handleAudioChange = async (e) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) await validateAndProcessFile(file);
  };

  const handleClearAudio = () => {
    setAudioFile(null);
    setError(null);
  };

  const handleCoverChange = (e) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      setCoverFile(file);
      setCoverPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleClearCover = () => {
    setCoverFile(null);
    setCoverPreviewUrl(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isEditing && !audioFile) { setError('Please upload an audio file.'); return; }
    const submitData = {
      ...formData,
    };
    onSubmit(submitData, audioFile, coverFile);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="beat-form"
    >
      {error && (
        <Card className="error-card">
          <p className="error-message">{error}</p>
        </Card>
      )}

      <div className="form-grid">
        {/* Left Column: Audio & Cover */}
        <div className="form-column">
          {/* Audio Upload Section */}
          {!isEditing && (
            <Card className="form-section">
              <div className="section-header-with-icon">
                <Music size={24} className="section-icon" />
                <div className="section-header-text">
                  <h2>Audio File</h2>
                  <p className="section-description">Upload your beat (MP3, WAV, FLAC, AAC)</p>
                </div>
              </div>

              <div className="form-fields">
                <FileUploader
                  id="audio-upload"
                  accept=".mp3,.wav,.flac,.aac"
                  file={audioFile}
                  onChange={handleAudioChange}
                  onClear={handleClearAudio}
                  title="Drop your beat here"
                  description="or click to browse files"
                  formats="MP3, WAV, FLAC, AAC"
                  maxSizeText="Max 50MB"
                />
              </div>
            </Card>
          )}

          {/* Cover Art Section */}
          <Card className="form-section">
            <div className="section-header-with-icon">
              <Image size={24} className="section-icon" />
              <div className="section-header-text">
                <h2>Cover Art</h2>
                <p className="section-description">Upload an image for your beat</p>
              </div>
            </div>

            <div className="form-fields">
              <FileUploader
                id="cover-upload"
                accept=".jpg,.jpeg,.png,.webp"
                file={coverFile}
                onChange={handleCoverChange}
                onClear={handleClearCover}
                title="Drop your cover here"
                description="or click to upload image"
                formats="JPG, PNG, WEBP"
                maxSizeText="Max 5MB"
                isImage={true}
                previewUrl={coverPreviewUrl}
                icon={Image}
              />
            </div>
          </Card>
        </div>

        {/* Right Column: Metadata */}
        <div className="form-column">
          {/* Beat Metadata */}
          <Card className="form-section">
            <div className="section-header-with-icon">
              <FileText size={24} className="section-icon" />
              <div className="section-header-text">
                <h2>Beat Information</h2>
                <p className="section-description">Add details about your beat</p>
              </div>
            </div>

            <div className="form-fields">
              {/* Title - Full Width Directo */}
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

              {/* Genre and Key - Grid Row */}
              <div className="field-row">
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

              {/* Description Directo */}
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

              {/* Tags Section */}
              <div className="tag-wrapper-block">
                <label className="input-label tag-label">
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
            <div className="section-header-with-icon">
              <Eye size={24} className="section-icon" />
              <div className="section-header-text">
                <h2>Visibility & Download Options</h2>
                <p className="section-description">Configure who can see and download your beat</p>
              </div>
            </div>

            <div className="form-fields">
              <div className="toggle-row">
                <Toggle
                  label="Public"
                  description="Visible to everyone"
                  icon={<Eye size={16} />}
                  checked={formData.isPublic}
                  onChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
                />

                {formData.isPublic && (
                  <Toggle
                    label="Allow downloads"
                    description="Users can download this beat"
                    icon={<Download size={16} />}
                    checked={formData.isDownloadable}
                    onChange={(checked) => setFormData(prev => ({ ...prev, isDownloadable: checked }))}
                  />
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

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