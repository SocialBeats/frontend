import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { updateMyProfile } from '@/services/profileService';
import './SocialLinkEditor.css';

const SOCIAL_NETWORKS = {
    spotify: {
        name: 'Spotify',
        color: '#1DB954',
        placeholder: 'https://open.spotify.com/user/...',
        urlPattern: /^https?:\/\/(open\.)?spotify\.com\//,
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
        ),
    },
    soundcloud: {
        name: 'SoundCloud',
        color: '#FF5500',
        placeholder: 'https://soundcloud.com/...',
        urlPattern: /^https?:\/\/(www\.)?soundcloud\.com\//,
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M1.175 12.225c-.051 0-.094.046-.101.1l-.233 2.154.233 2.105c.007.058.05.098.101.098.05 0 .09-.04.099-.098l.255-2.105-.27-2.154c-.009-.054-.048-.1-.084-.1zm-.899.828c-.059 0-.091.037-.104.094l-.196 1.327.196 1.373c.013.057.045.097.104.097.05 0 .088-.04.098-.097l.227-1.373-.227-1.327c-.01-.057-.048-.094-.098-.094zm1.938-.621c-.068 0-.114.05-.121.108l-.218 1.894.218 1.94c.007.059.053.109.121.109.066 0 .112-.05.12-.109l.249-1.94-.249-1.894c-.008-.058-.054-.108-.12-.108zm.956-.086c-.076 0-.129.059-.135.117l-.203 1.98.203 2.027c.006.068.059.117.135.117.068 0 .12-.049.127-.117l.232-2.027-.232-1.98c-.007-.058-.059-.117-.127-.117zm1.063-.143c-.085 0-.145.059-.151.127l-.188 2.123.188 2.155c.006.068.066.127.151.127.08 0 .14-.059.148-.127l.217-2.155-.217-2.123c-.008-.068-.068-.127-.148-.127zm1.073-.068c-.093 0-.16.068-.167.135l-.173 2.191.173 2.205c.007.076.074.135.167.135.091 0 .158-.059.165-.135l.199-2.205-.199-2.191c-.007-.067-.074-.135-.165-.135zm1.182-.076c-.102 0-.177.076-.184.153l-.159 2.267.159 2.287c.007.076.082.153.184.153.1 0 .174-.068.182-.153l.182-2.287-.182-2.267c-.008-.077-.082-.153-.182-.153zm1.173.008c-.111 0-.193.076-.2.161l-.144 2.259.144 2.279c.007.085.089.16.2.16.109 0 .191-.076.2-.16l.165-2.279-.165-2.259c-.009-.085-.091-.161-.2-.161zm1.19-.126c-.12 0-.21.086-.216.17l-.128 2.385.128 2.38c.006.094.096.17.216.17.119 0 .209-.076.218-.17l.148-2.38-.148-2.385c-.009-.084-.099-.17-.218-.17zM10 9.56c-.129 0-.226.094-.233.179l-.113 2.411.113 2.37c.007.094.104.178.233.178.127 0 .225-.084.232-.178l.13-2.37-.13-2.411c-.007-.085-.105-.179-.232-.179zm1.195-.203c-.138 0-.242.102-.249.187l-.1 2.606.1 2.561c.007.102.111.186.249.186.137 0 .24-.084.248-.186l.115-2.561-.115-2.606c-.008-.085-.111-.187-.248-.187zm1.196-.017c-.147 0-.259.093-.266.196l-.085 2.623.085 2.544c.007.102.119.195.266.195.145 0 .258-.093.266-.195l.098-2.544-.098-2.623c-.008-.103-.121-.196-.266-.196zm1.196.001c-.156 0-.275.102-.283.204l-.07 2.622.07 2.527c.008.111.127.204.283.204.154 0 .273-.093.281-.204l.08-2.527-.08-2.622c-.008-.102-.127-.204-.281-.204zm6.415-.161c-.275 0-.538.054-.779.149-.161-1.825-1.687-3.261-3.559-3.261-.468 0-.91.093-1.325.24-.154.059-.195.119-.196.237v6.444c.002.119.088.22.203.236l5.656.004c1.331 0 2.41-1.082 2.41-2.416 0-1.334-1.079-2.633-2.41-2.633z" />
            </svg>
        ),
    },
};

export default function SocialLinkEditor({
    network,
    value,
    isOwnProfile,
    onUpdate,
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState(value || '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const inputRef = useRef(null);

    const config = SOCIAL_NETWORKS[network];
    const isLinked = !!value;

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isEditing) {
                handleCancel();
            }
        };

        if (isEditing) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isEditing]);

    const handleIconClick = () => {
        if (!isOwnProfile) {
            if (isLinked) {
                window.open(value, '_blank', 'noopener,noreferrer');
            }
            return;
        }
        setInputValue(value || '');
        setError('');
        setIsEditing(true);
    };

    const validateUrl = (url) => {
        if (!url.trim()) return true;

        if (!config.urlPattern.test(url)) {
            return false;
        }
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const handleSave = async () => {
        const trimmedValue = inputValue.trim();

        if (trimmedValue && !validateUrl(trimmedValue)) {
            setError(`URL inválida. Ejemplo: ${config.placeholder}`);
            return;
        }

        try {
            setSaving(true);
            setError('');

            const updatePayload = {
                contact: {
                    social_media: {
                        [network]: trimmedValue,
                    },
                },
            };

            await updateMyProfile(updatePayload);

            if (onUpdate) {
                onUpdate(network, trimmedValue);
            }

            setIsEditing(false);
        } catch (err) {
            console.error('Error saving social link:', err);
            setError('Error al guardar. Inténtalo de nuevo.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setInputValue(value || '');
        setError('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSave();
        }
    };

    const handleClear = () => {
        setInputValue('');
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            handleCancel();
        }
    };

    if (!config) return null;

    return (
        <>
            <button
                className={`social-icon-btn ${isLinked ? 'linked' : 'unlinked'} ${isOwnProfile ? 'editable' : ''}`}
                style={{
                    '--social-color': config.color,
                }}
                onClick={handleIconClick}
                title={isLinked
                    ? (isOwnProfile ? `Editar ${config.name}` : `Abrir ${config.name}`)
                    : (isOwnProfile ? `Añadir ${config.name}` : config.name)
                }
                aria-label={config.name}
            >
                <span className="social-icon-svg">{config.icon}</span>
            </button>

            {isEditing && createPortal(
                <div className="social-popover-overlay" onClick={handleOverlayClick}>
                    <div className="social-popover" onClick={(e) => e.stopPropagation()}>
                        <div className="social-popover-header">
                            <span className="social-popover-icon" style={{ color: config.color }}>
                                {config.icon}
                            </span>
                            <span className="social-popover-title">
                                {isLinked ? `Editar ${config.name}` : `Añadir ${config.name}`}
                            </span>
                        </div>

                        <div className="social-popover-body">
                            <label className="social-popover-label">
                                Enlace a tu perfil de {config.name}
                            </label>
                            <div className="social-input-wrapper">
                                <input
                                    ref={inputRef}
                                    type="url"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={config.placeholder}
                                    className={`social-input ${error ? 'has-error' : ''}`}
                                    disabled={saving}
                                />
                                {inputValue && (
                                    <button
                                        type="button"
                                        className="social-input-clear"
                                        onClick={handleClear}
                                        title="Limpiar"
                                        disabled={saving}
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>

                            {error && <p className="social-error">{error}</p>}
                        </div>

                        <div className="social-popover-actions">
                            <button
                                type="button"
                                className="social-btn social-btn-cancel"
                                onClick={handleCancel}
                                disabled={saving}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="social-btn social-btn-save"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
