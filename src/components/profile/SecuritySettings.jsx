import { useState, useEffect } from 'react';
import {
    get2FAStatus,
    setup2FA,
    enable2FA,
    disable2FA,
    getBackupCodes,
    regenerateBackupCodes,
    changePassword
} from '../../services/authService';
import Button from '../ui/Button';
import './SecuritySettings.css';

export default function SecuritySettings() {
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [showSetupWizard, setShowSetupWizard] = useState(false);
    const [setupStep, setSetupStep] = useState(1);
    const [setupData, setSetupData] = useState(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [backupCodes, setBackupCodes] = useState([]);

    const [showDisableModal, setShowDisableModal] = useState(false);
    const [disableCode, setDisableCode] = useState('');

    const [showBackupCodes, setShowBackupCodes] = useState(false);
    const [regenerateCode, setRegenerateCode] = useState('');
    const [showRegenerateModal, setShowRegenerateModal] = useState(false);

    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            setLoading(true);
            const data = await get2FAStatus();
            setIs2FAEnabled(data.enabled);
        } catch (err) {
            setError('Error al obtener el estado de 2FA');
        } finally {
            setLoading(false);
        }
    };

    const handleStartSetup = async () => {
        try {
            setActionLoading(true);
            setError('');
            const data = await setup2FA();
            setSetupData(data);
            setShowSetupWizard(true);
            setSetupStep(1);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al iniciar la configuración de 2FA');
        } finally {
            setActionLoading(false);
        }
    };

    const handleVerifyAndEnable = async () => {
        if (verificationCode.length !== 6) {
            setError('El código debe tener 6 dígitos');
            return;
        }

        try {
            setActionLoading(true);
            setError('');
            const result = await enable2FA(verificationCode);
            setBackupCodes(result.backupCodes);
            setSetupStep(3);
            setIs2FAEnabled(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Código inválido. Intenta de nuevo.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDisable2FA = async () => {
        if (disableCode.length < 6) {
            setError('Introduce un código válido');
            return;
        }

        try {
            setActionLoading(true);
            setError('');
            await disable2FA(disableCode);
            setIs2FAEnabled(false);
            setShowDisableModal(false);
            setDisableCode('');
            setSuccess('2FA desactivado correctamente');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Código inválido');
        } finally {
            setActionLoading(false);
        }
    };

    const handleViewBackupCodes = async () => {
        try {
            setActionLoading(true);
            setError('');
            const data = await getBackupCodes();
            setBackupCodes(data.backupCodes);
            setShowBackupCodes(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al obtener los códigos de respaldo');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRegenerateBackupCodes = async () => {
        if (regenerateCode.length !== 6) {
            setError('El código debe tener 6 dígitos');
            return;
        }

        try {
            setActionLoading(true);
            setError('');
            const data = await regenerateBackupCodes(regenerateCode);
            setBackupCodes(data.backupCodes);
            setShowRegenerateModal(false);
            setRegenerateCode('');
            setSuccess('Códigos de respaldo regenerados');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Código inválido');
        } finally {
            setActionLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError('');

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (passwordData.newPassword.length < 8) {
            setError('La nueva contraseña debe tener al menos 8 caracteres');
            return;
        }

        try {
            setActionLoading(true);
            await changePassword(passwordData.currentPassword, passwordData.newPassword);
            setSuccess('Contraseña cambiada correctamente');
            setShowPasswordForm(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            const message = err.response?.data?.message || 'Error al cambiar la contraseña';
            setError(message === 'Current password is incorrect' ? 'La contraseña actual es incorrecta' : message);
        } finally {
            setActionLoading(false);
        }
    };

    const closeSetupWizard = () => {
        setShowSetupWizard(false);
        setSetupStep(1);
        setSetupData(null);
        setVerificationCode('');
        setBackupCodes([]);
    };

    const copyBackupCodes = () => {
        const codesText = backupCodes.join('\n');
        navigator.clipboard.writeText(codesText);
        setSuccess('Códigos copiados al portapapeles');
        setTimeout(() => setSuccess(''), 2000);
    };

    if (loading) {
        return (
            <div className="security-settings">
                <div className="security-loading">
                    <div className="spinner"></div>
                    <p>Cargando configuración de seguridad...</p>
                </div>
            </div>
        );
    }

    return (
        <div id="security-settings-section" className="security-settings">
            <div className="security-header">
                <div className="security-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <div>
                    <h2>Seguridad de la cuenta</h2>
                    <p className="security-subtitle">Gestiona la protección de tu cuenta</p>
                </div>
            </div>

            {error && <div className="security-error">{error}</div>}
            {success && <div className="security-success">{success}</div>}

            {/* Sección Cambio de Contraseña */}
            <div className="security-section">
                <div className="security-section-header">
                    <div className="section-info">
                        <h3>Contraseña</h3>
                        <p>Cambia tu contraseña regularmente para mantener tu cuenta segura</p>
                    </div>
                </div>

                {showPasswordForm ? (
                    <form className="password-form" onSubmit={handleChangePassword}>
                        <div className="password-form-fields">
                            <div className="password-input-group">
                                <label>Contraseña actual</label>
                                <input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <div className="password-input-group">
                                <label>Nueva contraseña</label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    placeholder="Mínimo 8 caracteres"
                                    minLength={8}
                                    required
                                />
                            </div>
                            <div className="password-input-group">
                                <label>Confirmar nueva contraseña</label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    placeholder="Repite la nueva contraseña"
                                    required
                                />
                            </div>
                        </div>
                        <div className="password-form-actions">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                    setShowPasswordForm(false);
                                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                    setError('');
                                }}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={actionLoading}
                            >
                                {actionLoading ? 'Guardando...' : 'Cambiar contraseña'}
                            </Button>
                        </div>
                    </form>
                ) : (
                    <Button
                        variant="secondary"
                        onClick={() => setShowPasswordForm(true)}
                    >
                        Cambiar contraseña
                    </Button>
                )}
            </div>

            {/* Sección 2FA */}
            <div className="security-section">
                <div className="security-section-header-row">
                    <h3>Autenticación de dos factores (2FA)</h3>
                    <p className="section-description">Añade una capa extra de seguridad a tu cuenta usando una aplicación autenticadora</p>
                    <div className={`status-badge ${is2FAEnabled ? 'enabled' : 'disabled'}`}>
                        {is2FAEnabled ? 'Activado' : 'Desactivado'}
                    </div>
                </div>

                {is2FAEnabled ? (
                    <div className="two-fa-actions">
                        <Button
                            variant="secondary"
                            onClick={handleViewBackupCodes}
                            disabled={actionLoading}
                        >
                            Ver códigos de respaldo
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() => setShowDisableModal(true)}
                            disabled={actionLoading}
                        >
                            Desactivar 2FA
                        </Button>
                    </div>
                ) : (
                    <Button
                        variant="primary"
                        onClick={handleStartSetup}
                        disabled={actionLoading}
                    >
                        {actionLoading ? 'Configurando...' : 'Activar 2FA'}
                    </Button>
                )}
            </div>

            {/* Modal de configuración de 2FA */}
            {showSetupWizard && (
                <div className="modal-overlay" onClick={closeSetupWizard}>
                    <div className="security-modal setup-wizard" onClick={e => e.stopPropagation()}>
                        {setupStep === 1 && (
                            <>
                                <div className="wizard-header">
                                    <h3>Paso 1: Escanea el código QR</h3>
                                    <p>Usa tu aplicación (Google Authenticator, Authy, etc.)</p>
                                </div>

                                <div className="qr-container">
                                    <img src={setupData?.qrCode} alt="QR Code" className="qr-code" />
                                </div>

                                <div className="secret-key">
                                    <p>¿No puedes escanear? Introduce este código manualmente:</p>
                                    <code>{setupData?.secret}</code>
                                </div>

                                <div className="wizard-actions">
                                    <Button variant="ghost" onClick={closeSetupWizard}>Cancelar</Button>
                                    <Button variant="primary" onClick={() => setSetupStep(2)}>Siguiente</Button>
                                </div>
                            </>
                        )}

                        {setupStep === 2 && (
                            <>
                                <div className="wizard-header">
                                    <h3>Paso 2: Verifica tu código</h3>
                                    <p>Introduce el código de 6 dígitos de tu aplicación</p>
                                </div>

                                <div className="verification-input">
                                    <input
                                        type="text"
                                        maxLength="6"
                                        value={verificationCode}
                                        onChange={e => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                                        placeholder="000000"
                                        className="code-input"
                                        autoFocus
                                    />
                                </div>

                                <div className="wizard-actions">
                                    <Button variant="ghost" onClick={() => setSetupStep(1)}>Atrás</Button>
                                    <Button
                                        variant="primary"
                                        onClick={handleVerifyAndEnable}
                                        disabled={actionLoading || verificationCode.length !== 6}
                                    >
                                        {actionLoading ? 'Verificando...' : 'Verificar y activar'}
                                    </Button>
                                </div>
                            </>
                        )}

                        {setupStep === 3 && (
                            <>
                                <div className="wizard-header success">
                                    <div className="success-icon">✓</div>
                                    <h3>¡2FA Activado!</h3>
                                    <p>Guarda estos códigos de respaldo en un lugar seguro.</p>
                                </div>

                                <div className="backup-codes-grid">
                                    {backupCodes.map((code, index) => (
                                        <code key={index} className="backup-code">{code}</code>
                                    ))}
                                </div>

                                <div className="backup-warning">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M12 9V13M12 17H12.01M5.07 19H18.93C20.47 19 21.45 17.33 20.68 16L13.75 4C12.98 2.67 11.02 2.67 10.25 4L3.32 16C2.55 17.33 3.53 19 5.07 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <span>Cada código solo puede usarse una vez</span>
                                </div>

                                <div className="wizard-actions">
                                    <Button variant="secondary" onClick={copyBackupCodes}>Copiar códigos</Button>
                                    <Button variant="primary" onClick={closeSetupWizard}>Entendido</Button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Modal para desactivar 2FA */}
            {showDisableModal && (
                <div className="modal-overlay" onClick={() => setShowDisableModal(false)}>
                    <div className="security-modal" onClick={e => e.stopPropagation()}>
                        <h3>Desactivar 2FA</h3>
                        <p>Introduce tu código de autenticación o un código de respaldo.</p>

                        <div className="verification-input">
                            <input
                                type="text"
                                value={disableCode}
                                onChange={e => setDisableCode(e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase())}
                                placeholder="Código"
                                className="code-input"
                                autoFocus
                            />
                        </div>

                        <div className="wizard-actions">
                            <Button variant="ghost" onClick={() => {
                                setShowDisableModal(false);
                                setDisableCode('');
                                setError('');
                            }}>Cancelar</Button>
                            <Button variant="danger" onClick={handleDisable2FA} disabled={actionLoading}>
                                {actionLoading ? 'Desactivando...' : 'Desactivar'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para ver códigos de backup */}
            {showBackupCodes && (
                <div className="modal-overlay" onClick={() => setShowBackupCodes(false)}>
                    <div className="security-modal" onClick={e => e.stopPropagation()}>
                        <h3>Códigos de respaldo</h3>
                        <p>Códigos restantes: {backupCodes.length} disponibles</p>

                        <div className="backup-codes-grid">
                            {backupCodes.map((code, index) => (
                                <code key={index} className="backup-code">{code}</code>
                            ))}
                        </div>

                        <div className="wizard-actions">
                            <Button variant="secondary" onClick={() => {
                                setShowBackupCodes(false);
                                setShowRegenerateModal(true);
                            }}>Regenerar</Button>
                            <Button variant="secondary" onClick={copyBackupCodes}>Copiar</Button>
                            <Button variant="primary" onClick={() => setShowBackupCodes(false)}>Cerrar</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para regenerar códigos */}
            {showRegenerateModal && (
                <div className="modal-overlay" onClick={() => setShowRegenerateModal(false)}>
                    <div className="security-modal" onClick={e => e.stopPropagation()}>
                        <h3>Regenerar códigos de respaldo</h3>
                        <p>Introduce tu código de autenticación. Los códigos anteriores serán invalidados.</p>

                        <div className="verification-input">
                            <input
                                type="text"
                                maxLength="6"
                                value={regenerateCode}
                                onChange={e => setRegenerateCode(e.target.value.replace(/\D/g, ''))}
                                placeholder="000000"
                                className="code-input"
                                autoFocus
                            />
                        </div>

                        <div className="wizard-actions">
                            <Button variant="ghost" onClick={() => {
                                setShowRegenerateModal(false);
                                setRegenerateCode('');
                                setShowBackupCodes(true);
                            }}>Cancelar</Button>
                            <Button
                                variant="primary"
                                onClick={handleRegenerateBackupCodes}
                                disabled={actionLoading || regenerateCode.length !== 6}
                            >
                                {actionLoading ? 'Regenerando...' : 'Regenerar'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
