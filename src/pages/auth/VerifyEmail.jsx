import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { verifyEmail, resendVerificationEmail, isAuthenticated } from '../../services/authService';
import { getMyProfile } from '../../services/profileService';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import TopNavBar from '../../components/ui/TopNavBar';
import ErrorModal from '../../components/ui/ErrorModal';
import logo from '../../assets/logo-dark-no-fondo.png';

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error', 'pending'
    const [username, setUsername] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [resendEmail, setResendEmail] = useState('');
    const [resendStatus, setResendStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
    const [errorModal, setErrorModal] = useState({ show: false, message: '' });
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const initialize = async () => {
            // Si hay token, verificar el email
            if (token) {
                verifyEmailWithToken();
                return;
            }

            // Si el usuario está logueado, obtener su email
            if (isAuthenticated()) {
                setIsLoggedIn(true);
                try {
                    const profile = await getMyProfile();
                    setUserEmail(profile.email || '');
                    setUsername(profile.username || '');
                    setStatus('pending');
                } catch (error) {
                    setStatus('pending');
                }
            } else {
                setStatus('pending');
            }
        };

        initialize();
    }, [token]);

    const verifyEmailWithToken = async () => {
        try {
            const response = await verifyEmail(token);
            setUsername(response.username || '');
            setStatus('success');
        } catch (error) {
            const errorData = error.response?.data;
            setErrorMessage(errorData?.message || 'Error al verificar el correo');
            setStatus('error');
        }
    };

    const handleResendEmail = async (e) => {
        e.preventDefault();

        const emailToUse = isLoggedIn ? userEmail : resendEmail;

        if (!emailToUse) {
            setErrorModal({ show: true, message: 'Por favor, ingresa tu email' });
            return;
        }

        setResendStatus('loading');

        try {
            await resendVerificationEmail(emailToUse);
            setResendStatus('success');
        } catch (error) {
            const errorData = error.response?.data;

            if (errorData?.error === 'ALREADY_VERIFIED') {
                setErrorModal({ show: true, message: 'Este email ya está verificado. Puedes acceder a la app.' });
                setTimeout(() => navigate('/app/profile'), 2000);
            } else if (errorData?.error === 'USER_NOT_FOUND') {
                setErrorModal({ show: true, message: 'No encontramos una cuenta con este email.' });
            } else {
                setErrorModal({ show: true, message: errorData?.message || 'Error al enviar el correo de verificación' });
            }
            setResendStatus('error');
        }
    };

    // Estado de carga
    if (status === 'loading') {
        return (
            <>
                <TopNavBar />
                <div className="flex-center" style={{ minHeight: '100vh', padding: '2rem', paddingTop: '6rem' }}>
                    <Card className="glass-panel animate-fade-in" padding="large" style={{ maxWidth: '500px', width: '100%' }}>
                        <div className="flex-center" style={{ flexDirection: 'column', textAlign: 'center' }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1.5rem',
                                animation: 'pulse 2s infinite'
                            }}>
                                <div className="loading-spinner" style={{ width: '40px', height: '40px' }}></div>
                            </div>
                            <h2 style={{ marginBottom: '1rem' }}>Verificando tu correo...</h2>
                            <p style={{ color: 'var(--text-muted)' }}>
                                Por favor espera mientras verificamos tu dirección de correo electrónico.
                            </p>
                        </div>
                    </Card>
                </div>
                <style>{`
                    @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.5; }
                    }
                    .loading-spinner {
                        border: 3px solid rgba(255, 255, 255, 0.3);
                        border-top: 3px solid white;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                    }
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </>
        );
    }

    // Verificación exitosa
    if (status === 'success') {
        return (
            <>
                <TopNavBar />
                <div className="flex-center" style={{ minHeight: '100vh', padding: '2rem', paddingTop: '6rem' }}>
                    <Card className="glass-panel animate-fade-in" padding="large" style={{ maxWidth: '500px', width: '100%' }}>
                        <div className="flex-center" style={{ flexDirection: 'column', textAlign: 'center' }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1.5rem',
                                fontSize: '2.5rem'
                            }}>
                                🎉
                            </div>
                            <h2 style={{ marginBottom: '1rem' }}>¡Email verificado!</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                                {username ? (
                                    <>¡Felicidades, <strong>{username}</strong>! Tu correo ha sido verificado exitosamente.</>
                                ) : (
                                    <>Tu correo ha sido verificado exitosamente.</>
                                )}
                            </p>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.6' }}>
                                Ya tienes acceso completo a todas las funcionalidades de la plataforma.
                            </p>
                            <Link to={isAuthenticated() ? '/app/profile' : '/login'}>
                                <Button variant="primary" size="large">
                                    {isAuthenticated() ? 'Ir al Perfil' : 'Iniciar sesión'}
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </div>
            </>
        );
    }

    // Error de verificación
    if (status === 'error') {
        return (
            <>
                <TopNavBar />
                <div className="flex-center" style={{ minHeight: '100vh', padding: '2rem', paddingTop: '6rem' }}>
                    <Card className="glass-panel animate-fade-in" padding="large" style={{ maxWidth: '500px', width: '100%' }}>
                        <div className="flex-center" style={{ flexDirection: 'column', textAlign: 'center' }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1.5rem',
                                fontSize: '2.5rem'
                            }}>
                                ⚠️
                            </div>
                            <h2 style={{ marginBottom: '1rem' }}>Enlace expirado</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.6' }}>
                                {errorMessage.includes('expired') || errorMessage.includes('Invalid')
                                    ? 'El enlace de verificación ha expirado o no es válido.'
                                    : errorMessage}
                            </p>
                            <Button
                                variant="primary"
                                size="large"
                                onClick={() => setStatus('pending')}
                            >
                                Solicitar nuevo enlace
                            </Button>
                            <div style={{ marginTop: '1rem' }}>
                                <Link to="/login" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                    Volver al inicio de sesión
                                </Link>
                            </div>
                        </div>
                    </Card>
                </div>
            </>
        );
    }

    // Email reenviado exitosamente
    if (resendStatus === 'success') {
        return (
            <>
                <TopNavBar />
                <div className="flex-center" style={{ minHeight: '100vh', padding: '2rem', paddingTop: '6rem' }}>
                    <Card className="glass-panel animate-fade-in" padding="large" style={{ maxWidth: '500px', width: '100%' }}>
                        <div className="flex-center" style={{ flexDirection: 'column', textAlign: 'center' }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1.5rem',
                                fontSize: '2.5rem'
                            }}>
                                ✉️
                            </div>
                            <h2 style={{ marginBottom: '1rem' }}>¡Correo enviado!</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                                Hemos enviado un enlace de verificación a <strong>{isLoggedIn ? userEmail : resendEmail}</strong>.
                            </p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
                                El enlace expirará en 24 horas. Si no recibes el correo, revisa tu carpeta de spam.
                            </p>
                            <Button
                                variant="outline"
                                size="large"
                                onClick={() => setResendStatus('idle')}
                            >
                                Enviar otro correo
                            </Button>
                        </div>
                    </Card>
                </div>
            </>
        );
    }

    // Pantalla de pendiente de verificación (después del registro o para reenviar)
    return (
        <>
            <TopNavBar />
            <div className="flex-center" style={{ minHeight: '100vh', padding: '2rem', paddingTop: '6rem' }}>
                <Card className="glass-panel animate-fade-in" padding="large" style={{ maxWidth: '500px', width: '100%' }}>
                    <div className="flex-center" style={{ flexDirection: 'column', marginBottom: '2rem' }}>
                        <img src={logo} alt="SocialBeats" style={{ height: '60px', marginBottom: '1rem' }} />
                        <h2>Verifica tu correo</h2>
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                            {isLoggedIn
                                ? 'Te hemos enviado un correo de verificación. Revisa tu bandeja de entrada.'
                                : 'Ingresa tu email para recibir un nuevo enlace de verificación'
                            }
                        </p>
                    </div>

                    <form onSubmit={handleResendEmail}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {isLoggedIn ? (
                                // Usuario logueado: mostrar email sin poder editarlo
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        color: 'var(--text-muted)',
                                        fontSize: '0.875rem'
                                    }}>
                                        Email
                                    </label>
                                    <div style={{
                                        padding: '0.75rem 1rem',
                                        background: 'rgba(139, 92, 246, 0.1)',
                                        borderRadius: 'var(--radius-sm)',
                                        border: '1px solid rgba(139, 92, 246, 0.3)',
                                        color: 'var(--text-main)',
                                        fontSize: '1rem'
                                    }}>
                                        {userEmail}
                                    </div>
                                    <p style={{
                                        fontSize: '0.75rem',
                                        color: 'var(--text-muted)',
                                        marginTop: '0.5rem'
                                    }}>
                                        El correo de verificación se enviará a esta dirección
                                    </p>
                                </div>
                            ) : (
                                // Usuario no logueado: permitir ingresar email
                                <Input
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={resendEmail}
                                    onChange={(e) => setResendEmail(e.target.value)}
                                    fullWidth
                                    placeholder="tu@email.com"
                                />
                            )}

                            <div style={{
                                padding: '1rem',
                                background: 'rgba(139, 92, 246, 0.1)',
                                borderRadius: 'var(--radius-sm)',
                                borderLeft: '3px solid var(--primary)'
                            }}>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
                                    📧 Revisa tu bandeja de entrada y la carpeta de spam
                                </p>
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                fullWidth
                                size="large"
                                style={{ marginTop: '0.5rem' }}
                                disabled={resendStatus === 'loading' || (!isLoggedIn && !resendEmail)}
                            >
                                {resendStatus === 'loading' ? 'Enviando...' : 'Reenviar correo de verificación'}
                            </Button>
                        </div>
                    </form>

                    {isLoggedIn && (
                        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                            <Link to="/app/feed" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                Continuar sin verificar (acceso limitado)
                            </Link>
                        </div>
                    )}

                    {!isLoggedIn && (
                        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                            <p style={{ color: 'var(--text-muted)' }}>
                                ¿Ya verificaste tu cuenta?{' '}
                                <Link to="/login" style={{ fontWeight: '600' }}>
                                    Inicia sesión
                                </Link>
                            </p>
                        </div>
                    )}
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
