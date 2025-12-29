import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { verifyEmail, resendVerificationEmail, isAuthenticated } from '../../services/authService';
import { getMyProfile } from '../../services/profileService';
import Card from '../../components/ui/Card';
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
    const [resendStatus, setResendStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
    const [errorModal, setErrorModal] = useState({ show: false, message: '' });

    useEffect(() => {
        const initialize = async () => {
            // Si hay token, verificar el email
            if (token) {
                verifyEmailWithToken();
                return;
            }

            // Si el usuario está logueado, obtener su email
            if (isAuthenticated()) {
                try {
                    const profile = await getMyProfile();
                    setUserEmail(profile.email || '');
                    setUsername(profile.username || '');
                    setStatus('pending');
                } catch {
                    setStatus('pending');
                }
            } else {
                // Si no está logueado y no hay token, redirigir al login
                navigate('/login', { replace: true });
            }
        };

        initialize();
    }, [token, navigate]);

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

        if (!userEmail) {
            setErrorModal({ show: true, message: 'No se pudo obtener tu email. Intenta recargar la página.' });
            return;
        }

        setResendStatus('loading');

        try {
            await resendVerificationEmail(userEmail);
            setResendStatus('success');
        } catch (error) {
            const errorData = error.response?.data;

            if (errorData?.error === 'ALREADY_VERIFIED') {
                setErrorModal({ show: true, message: 'Tu email ya está verificado. Redirigiendo...' });
                setTimeout(() => navigate('/app/profile'), 2000);
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
                            {isAuthenticated() ? (
                                <Button
                                    variant="primary"
                                    size="large"
                                    onClick={() => setStatus('pending')}
                                >
                                    Solicitar nuevo enlace
                                </Button>
                            ) : (
                                <Link to="/login">
                                    <Button variant="primary" size="large">
                                        Iniciar sesión
                                    </Button>
                                </Link>
                            )}
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
                                Hemos enviado un enlace de verificación a <strong>{userEmail}</strong>.
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

    // Pantalla de pendiente de verificación (solo para usuarios logueados)
    return (
        <>
            <TopNavBar />
            <div className="flex-center" style={{ minHeight: '100vh', padding: '2rem', paddingTop: '6rem' }}>
                <Card className="glass-panel animate-fade-in" padding="large" style={{ maxWidth: '500px', width: '100%' }}>
                    <div className="flex-center" style={{ flexDirection: 'column', marginBottom: '2rem' }}>
                        <img src={logo} alt="SocialBeats" style={{ height: '60px', marginBottom: '1rem' }} />
                        <h2>Verifica tu correo</h2>
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                            Te hemos enviado un correo de verificación. Revisa tu bandeja de entrada.
                        </p>
                    </div>

                    <form onSubmit={handleResendEmail}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {/* Mostrar email del usuario sin poder editarlo */}
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
                                    {userEmail || 'Cargando...'}
                                </div>
                            </div>

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
                                disabled={resendStatus === 'loading' || !userEmail}
                            >
                                {resendStatus === 'loading' ? 'Enviando...' : 'Reenviar correo de verificación'}
                            </Button>
                        </div>
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
