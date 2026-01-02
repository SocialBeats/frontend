import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, verify2FA, isAuthenticated } from '../../services/authService';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import TopNavBar from '../../components/ui/TopNavBar';
import ErrorModal from '../../components/ui/ErrorModal';
import logo from '../../assets/logo-dark-no-fondo.png';
import './Login.css';

export default function Login() {
    const navigate = useNavigate();

    // Redirigir si ya está autenticado
    useEffect(() => {
        if (isAuthenticated()) {
            navigate('/app/feed', { replace: true });
        }
    }, [navigate]);

    const [formData, setFormData] = useState({
        identifier: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [errorModal, setErrorModal] = useState({ show: false, message: '' });

    const [requires2FA, setRequires2FA] = useState(false);
    const [tempToken, setTempToken] = useState('');
    const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
    const [useBackupCode, setUseBackupCode] = useState(false);
    const [backupCode, setBackupCode] = useState('');
    const otpInputRefs = useRef([]);
    const backupInputRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.identifier) newErrors.identifier = 'Ingresa tu usuario o email';
        if (!formData.password) newErrors.password = 'Ingresa tu contraseña';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleOtpChange = (index, value) => {
        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otpCode];
        newOtp[index] = value;
        setOtpCode(newOtp);

        if (value && index < 5) {
            otpInputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
            otpInputRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (/^\d+$/.test(pastedData)) {
            const newOtp = [...otpCode];
            for (let i = 0; i < pastedData.length && i < 6; i++) {
                newOtp[i] = pastedData[i];
            }
            setOtpCode(newOtp);
            const nextEmpty = newOtp.findIndex(v => !v);
            const focusIndex = nextEmpty === -1 ? 5 : Math.min(nextEmpty, 5);
            otpInputRefs.current[focusIndex]?.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            const result = await login(formData.identifier, formData.password);

            if (result.require2FA) {
                setRequires2FA(true);
                setTempToken(result.tempToken);
                setIsLoading(false);
                setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
                return;
            }

            navigate('/app/feed');
        } catch (error) {
            const errorData = error.response?.data;
            const errorMessage = errorData?.message || errorData?.error || 'Error al iniciar sesión. Por favor intenta de nuevo.';
            setErrorModal({
                show: true,
                message: errorMessage === 'INVALID_CREDENTIALS' ? 'Usuario o contraseña incorrectos' : errorMessage,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify2FA = async (e) => {
        e.preventDefault();

        const code = useBackupCode ? backupCode.trim().toUpperCase() : otpCode.join('');

        if (useBackupCode) {
            if (code.length !== 8) {
                setErrorModal({
                    show: true,
                    message: 'El código de respaldo debe tener 8 caracteres',
                });
                return;
            }
        } else {
            if (code.length !== 6) {
                setErrorModal({
                    show: true,
                    message: 'Introduce el código completo de 6 dígitos',
                });
                return;
            }
        }

        setIsLoading(true);

        try {
            await verify2FA(tempToken, code);
            navigate('/app/feed');
        } catch (error) {
            const errorData = error.response?.data;
            const errorMessage = errorData?.message || 'Código inválido. Intenta de nuevo.';
            setErrorModal({
                show: true,
                message: errorMessage,
            });
            if (useBackupCode) {
                setBackupCode('');
                backupInputRef.current?.focus();
            } else {
                setOtpCode(['', '', '', '', '', '']);
                otpInputRefs.current[0]?.focus();
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        setRequires2FA(false);
        setTempToken('');
        setOtpCode(['', '', '', '', '', '']);
        setBackupCode('');
        setUseBackupCode(false);
    };

    const toggleBackupMode = () => {
        setUseBackupCode(!useBackupCode);
        setOtpCode(['', '', '', '', '', '']);
        setBackupCode('');
        setTimeout(() => {
            if (!useBackupCode) {
                backupInputRef.current?.focus();
            } else {
                otpInputRefs.current[0]?.focus();
            }
        }, 100);
    };

    if (requires2FA) {
        return (
            <>
                <TopNavBar />
                <div className="flex-center" style={{ minHeight: '100vh', padding: '2rem', paddingTop: '6rem' }}>
                    <Card className="glass-panel animate-fade-in" padding="large" style={{ maxWidth: '450px', width: '100%' }}>
                        <div className="flex-center" style={{ flexDirection: 'column', marginBottom: '2rem' }}>
                            <div className="two-factor-icon">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <h2>Verificación en dos pasos</h2>
                            <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                                {useBackupCode
                                    ? 'Introduce uno de tus códigos de respaldo'
                                    : 'Introduce el código de 6 dígitos de tu aplicación autenticadora'
                                }
                            </p>
                        </div>

                        <form onSubmit={handleVerify2FA}>
                            {useBackupCode ? (
                                <div className="backup-code-input-container">
                                    <input
                                        ref={backupInputRef}
                                        type="text"
                                        value={backupCode}
                                        onChange={(e) => setBackupCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))}
                                        placeholder="XXXXXXXX"
                                        className="backup-code-input"
                                        maxLength={8}
                                        autoFocus
                                    />
                                </div>
                            ) : (
                                <div className="otp-container">
                                    {otpCode.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={(el) => (otpInputRefs.current[index] = el)}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength="1"
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                            onPaste={handleOtpPaste}
                                            className="otp-input"
                                            autoComplete="one-time-code"
                                        />
                                    ))}
                                </div>
                            )}

                            <button
                                type="button"
                                className="backup-code-toggle"
                                onClick={toggleBackupMode}
                            >
                                {useBackupCode
                                    ? '← Usar código de la app'
                                    : '¿Perdiste acceso? Usa un código de respaldo'
                                }
                            </button>

                            <Button
                                type="submit"
                                variant="primary"
                                fullWidth
                                size="large"
                                style={{ marginTop: '1.5rem' }}
                                disabled={isLoading || (useBackupCode ? backupCode.length !== 8 : otpCode.join('').length !== 6)}
                            >
                                {isLoading ? 'Verificando...' : 'Verificar'}
                            </Button>

                            <Button
                                type="button"
                                variant="ghost"
                                fullWidth
                                size="medium"
                                style={{ marginTop: '0.5rem' }}
                                onClick={handleBack}
                            >
                                Volver al inicio de sesión
                            </Button>
                        </form>
                    </Card>

                    <ErrorModal
                        isOpen={errorModal.show}
                        onClose={() => setErrorModal({ show: false, message: '' })}
                        message={errorModal.message}
                    />
                </div>
            </>
        );
    }

    return (
        <>
            <TopNavBar />
            <div className="flex-center" style={{ minHeight: '100vh', padding: '2rem', paddingTop: '6rem' }}>
                <Card className="glass-panel animate-fade-in" padding="large" style={{ maxWidth: '450px', width: '100%' }}>
                    <div className="flex-center" style={{ flexDirection: 'column', marginBottom: '2rem' }}>
                        <img src={logo} alt="SocialBeats" style={{ height: '60px', marginBottom: '1rem' }} />
                        <h2>Bienvenido de nuevo</h2>
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                            Ingresa a tu cuenta para continuar
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <Input
                                label="Usuario / Email"
                                name="identifier"
                                value={formData.identifier}
                                onChange={handleChange}
                                error={errors.identifier}
                                fullWidth
                                placeholder="beat23 / beat23@email.com"
                            />

                            <Input
                                label="Contraseña"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                error={errors.password}
                                fullWidth
                                placeholder="••••••••"
                            />

                            <div style={{ textAlign: 'right' }}>
                                <Link to="/forgot-password" style={{ fontSize: '0.875rem', color: 'var(--primary-light)' }}>
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                fullWidth
                                size="large"
                                style={{ marginTop: '0.5rem' }}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                            </Button>
                        </div>
                    </form>

                    <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-muted)' }}>
                            ¿No tienes una cuenta?{' '}
                            <Link to="/register" style={{ fontWeight: '600' }}>
                                Regístrate gratis
                            </Link>
                        </p>
                    </div>
                </Card>

                <ErrorModal
                    isOpen={errorModal.show}
                    onClose={() => setErrorModal({ show: false, message: '' })}
                    message={errorModal.message}
                />
            </div>
        </>
    );
}
