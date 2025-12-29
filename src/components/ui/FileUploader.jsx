import React, { useRef, useState } from 'react';
import { UploadCloud, X, FileAudio, FileImage, Trash2 } from 'lucide-react';
import IconButton from './IconButton';
import './FileUploader.css';

const FileUploader = ({
    id,
    accept,
    file,
    onChange,
    onClear,
    title = "Drop your file here",
    description = "or click to browse files",
    formats,
    icon: Icon = UploadCloud,
    previewUrl,
    isImage = false,
    className = '',
    maxSizeText,
}) => {
    const [isDragActive, setIsDragActive] = useState(false);
    const dragCounter = useRef(0);
    const fileInputRef = useRef(null);

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current += 1;
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDragActive(true);
        }
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current -= 1;
        if (dragCounter.current === 0) {
            setIsDragActive(false);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
        dragCounter.current = 0;

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            // Create specialized event-like object or call onChange direct with files
            // But standard is event. So let's mimic event if parent expects event, 
            // or just pass file if parent expects file. 
            // BeatForm expects event for existing handler 'handleFileChange', 
            // OR we can adapt parent. Let's make this component emit just the file?
            // Actually parent handleFileChange (audio) takes 'e' and gets 'e.target.files[0]'.
            // Let's adapt this component to accept an 'onFileSelect' (files) and 'onChange' (event).
            // For simplicity/compatibility, let's just trigger onChange with a synthetic event if possible, 
            // OR better, change parent logic to accept file directly.
            // Parent: handleFileChange(e) -> validateAndProcessFile(e.target.files[0]).
            // I will update parent to handle simpler logic or I can do:
            const files = e.dataTransfer.files;
            // We'll mimic the event structure for compatibility with standard handlers
            const syntheticEvent = {
                target: { files: files }
            };
            onChange(syntheticEvent);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleInputChange = (e) => {
        onChange(e);
    };

    const handleClear = (e) => {
        e.stopPropagation();
        if (fileInputRef.current) fileInputRef.current.value = '';
        onClear();
    };

    return (
        <div
            className={`file-uploader-container ${className}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <input
                type="file"
                id={id}
                accept={accept}
                onChange={handleInputChange}
                className="file-input-hidden"
                ref={fileInputRef}
            />

            {/* State: Empty (No file and No Preview) */}
            {!file && !previewUrl ? (
                <div
                    className={`uploader-dropzone ${isDragActive ? 'uploader-dropzone-active' : ''}`}
                    onClick={handleClick}
                >
                    <div className="uploader-content">
                        <Icon size={48} className="uploader-icon" />
                        <h3 className="uploader-title">{title}</h3>
                        <p className="uploader-description">{description}</p>
                        {formats && <p className="uploader-formats">{formats} {maxSizeText && `• ${maxSizeText}`}</p>}
                    </div>
                </div>
            ) : (
                /* State: Loaded (File or Preview exists) */
                <div className="uploader-loaded-state">
                    {isImage && previewUrl ? (
                        <div className="image-preview-container">
                            <img src={previewUrl} alt="Preview" className="image-preview-img" />
                            <div className="image-overlay">
                                <button type="button" onClick={handleClear} className="remove-image-btn" aria-label="Remove image">
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="file-info-card">
                            <div className="file-info-left">
                                {isImage ? <FileImage size={24} className="file-type-icon" /> : <FileAudio size={24} className="file-type-icon" />}
                                <div className="file-details">
                                    <p className="file-name">{file ? file.name : "Uploaded File"}</p>
                                    {file && <p className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</p>}
                                </div>
                            </div>
                            <IconButton
                                variant="ghost"
                                size="medium"
                                onClick={handleClear}
                                className="file-remove-btn"
                                aria-label="Remove file"
                                type="button"
                            >
                                <X size={20} />
                            </IconButton>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FileUploader;
