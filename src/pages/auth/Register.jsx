import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import TopNavBar from '../../components/ui/TopNavBar';
import logo from '../../assets/logo-dark-no-fondo.png';
import { register } from '../../services/authService';
import '../../styles/index.css';

export default function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.username) newErrors.username = 'El usuario es obligatorio';
        if (!formData.email) newErrors.email = 'El email es obligatorio';
        if (!formData.password) newErrors.password = 'La contraseña es obligatoria';
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            setLoading(true);
            try {
                await register({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                });
                console.log('Usuario registrado exitosamente');
                navigate('/login');
            } catch (error) {
                console.error('Error en el registro:', error);
                setErrors({ 
                    submit: error.response?.data?.message || 'Error al registrar usuario' 
                });
            } finally {
                setLoading(false);
            }
        }
    };

    const isFormValid = Object.values(formData).every(val => val !== '') &&
        formData.password === formData.confirmPassword;

    return (
        <>
            <TopNavBar />
            <div className="flex-center" style={{ minHeight: '100vh', padding: '2rem', paddingTop: '6rem' }}>
                <Card className="glass-panel animate-fade-in" padding="large" style={{ maxWidth: '500px', width: '100%' }}>
                <div className="flex-center" style={{ flexDirection: 'column', marginBottom: '2rem' }}>
                    <img src={logo} alt="SocialBeats" style={{ height: '60px', marginBottom: '1rem' }} />
                    <h2>Crear cuenta</h2>
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                        Únete a la comunidad de productores musicales
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <Input
                            label="Nombre de usuario"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            error={errors.username}
                            fullWidth
                            placeholder="Ej. beatmaker23"
                        />

                        <Input
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            error={errors.email}
                            fullWidth
                            placeholder="tu@email.com"
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

                        {errors.submit && (
                            <div style={{ color: 'var(--error)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                                {errors.submit}
                            </div>
                        )}

                        <Button
                            type="submit"
                            variant="primary"
                            fullWidth
                            size="large"
                            disabled={!isFormValid || loading}
                            style={{ marginTop: '1rem' }}
                        >
                            {loading ? 'Registrando...' : 'Registrarse'}
                        </Button>
                    </div>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)' }}>
                        ¿Ya tienes una cuenta?{' '}
                        <Link to="/login" style={{ fontWeight: '600' }}>
                            Inicia sesión
                        </Link>
                    </p>
                </div>
            </Card>
        </div>
        </>
    );
}
