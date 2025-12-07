import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, isAuthenticated } from '../../services/authService';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import TopNavBar from '../../components/ui/TopNavBar';
import ErrorModal from '../../components/ui/ErrorModal';
import logo from '../../assets/logo-dark-no-fondo.png';

export default function Login() {
    const navigate = useNavigate();

    // Redirigir si ya está autenticado
    useEffect(() => {
        if (isAuthenticated()) {
            navigate('/app/feed', { replace: true });
        }
    }, [navigate]);
    const [formData, setFormData] = useState({
        identifier: '', // username or email
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
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
        if (!formData.identifier) newErrors.identifier = 'Ingresa tu usuario o email';
        if (!formData.password) newErrors.password = 'Ingresa tu contraseña';

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
            await login(formData.identifier, formData.password);
            // Login exitoso, redirigir al feed
            navigate('/app/feed');
        } catch (error) {
            console.error('Login error:', error);

            // Manejar errores específicos del backend
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
