import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword, isAuthenticated } from '../../services/authService';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import TopNavBar from '../../components/ui/TopNavBar';
import ErrorModal from '../../components/ui/ErrorModal';
import logo from '../../assets/logo-dark-no-fondo.png';

export default function ForgotPassword() {
    const navigate = useNavigate();

    // Redirigir si ya está autenticado
    useEffect(() => {
        if (isAuthenticated()) {
            navigate('/app/profile', { replace: true });
        }
    }, [navigate]);

    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errorModal, setErrorModal] = useState({ show: false, message: '' });

    const validateForm = () => {
        const newErrors = {};
        if (!email) {
            newErrors.email = 'El email es obligatorio';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Formato de email inválido';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            await forgotPassword(email);
            setIsSuccess(true);
        } catch (error) {
            console.error('Forgot password error:', error);
            setIsSuccess(true);
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
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
                                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1.5rem',
                                fontSize: '2.5rem'
                            }}>
                                ✉️
                            </div>
                            <h2 style={{ marginBottom: '1rem' }}>Revisa tu correo</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                                Si existe una cuenta asociada a <strong>{email}</strong>, te enviaremos un enlace para restablecer tu contraseña.
                            </p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
                                El enlace expirará en 1 hora. Si no recibes el correo, revisa tu carpeta de spam.
                            </p>
                            <Link to="/login">
                                <Button variant="outline" size="large">
                                    Volver al inicio de sesión
                                </Button>
                            </Link>
                        </div>
                    </Card>
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
                        <h2>¿Olvidaste tu contraseña?</h2>
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                            Ingresa tu email y te enviaremos un enlace para restablecerla
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <Input
                                label="Email"
                                name="email"
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (errors.email) setErrors({});
                                }}
                                error={errors.email}
                                fullWidth
                                placeholder="tu@email.com"
                            />

                            <Button
                                type="submit"
                                variant="primary"
                                fullWidth
                                size="large"
                                style={{ marginTop: '0.5rem' }}
                                disabled={isLoading || !email}
                            >
                                {isLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                            </Button>
                        </div>
                    </form>

                    <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-muted)' }}>
                            ¿Recordaste tu contraseña?{' '}
                            <Link to="/login" style={{ fontWeight: '600' }}>
                                Inicia sesión
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
