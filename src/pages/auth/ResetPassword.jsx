import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword, isAuthenticated } from '../../services/authService';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import TopNavBar from '../../components/ui/TopNavBar';
import ErrorModal from '../../components/ui/ErrorModal';
import logo from '../../assets/logo-dark-no-fondo.png';

export default function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    // Redirigir si ya está autenticado
    useEffect(() => {
        if (isAuthenticated()) {
            navigate('/app/profile', { replace: true });
        }
    }, [navigate]);

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errorModal, setErrorModal] = useState({ show: false, message: '' });

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

        if (!formData.password) {
            newErrors.password = 'La contraseña es obligatoria';
        } else if (formData.password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Confirma tu contraseña';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (!token) {
            setErrorModal({
                show: true,
                message: 'Token de restablecimiento no válido. Por favor, solicita un nuevo enlace.'
            });
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            await resetPassword(token, formData.password);
            setIsSuccess(true);
        } catch (error) {
            console.error('Reset password error:', error);
            const errorData = error.response?.data;
            const errorMessage = errorData?.message || errorData?.error || 'Error al restablecer la contraseña';

            setErrorModal({
                show: true,
                message: errorMessage.includes('Invalid') || errorMessage.includes('expired')
                    ? 'El enlace ha expirado o no es válido. Por favor, solicita uno nuevo.'
                    : errorMessage
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Si no hay token, mostrar error
    if (!token) {
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
                            <h2 style={{ marginBottom: '1rem' }}>Enlace inválido</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.6' }}>
                                El enlace de restablecimiento de contraseña no es válido o ha expirado.
                            </p>
                            <Link to="/forgot-password">
                                <Button variant="primary" size="large">
                                    Solicitar nuevo enlace
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </div>
            </>
        );
    }

    // Pantalla de éxito
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
                                background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1.5rem',
                                fontSize: '2.5rem'
                            }}>
                                ✅
                            </div>
                            <h2 style={{ marginBottom: '1rem' }}>¡Contraseña actualizada!</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.6' }}>
                                Tu contraseña ha sido restablecida exitosamente.
                                Ya puedes iniciar sesión con tu nueva contraseña.
                            </p>
                            <Link to="/login">
                                <Button variant="primary" size="large">
                                    Iniciar sesión
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
                        <h2>Nueva contraseña</h2>
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                            Ingresa tu nueva contraseña
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <Input
                                label="Nueva contraseña"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                error={errors.password}
                                fullWidth
                                placeholder="••••••••"
                            />

                            <Input
                                label="Confirmar contraseña"
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                error={errors.confirmPassword}
                                fullWidth
                                placeholder="••••••••"
                            />

                            <div style={{
                                padding: '0.75rem 1rem',
                                background: 'rgba(102, 126, 234, 0.1)',
                                borderRadius: '8px',
                                borderLeft: '3px solid var(--primary)'
                            }}>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
                                    💡 La contraseña debe tener al menos 6 caracteres
                                </p>
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                fullWidth
                                size="large"
                                style={{ marginTop: '0.5rem' }}
                                disabled={isLoading || !formData.password || !formData.confirmPassword}
                            >
                                {isLoading ? 'Actualizando...' : 'Actualizar contraseña'}
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
