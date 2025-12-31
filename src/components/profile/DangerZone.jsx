import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import DeleteAccountModal from './DeleteAccountModal';
import SuccessModal from '@/components/ui/SuccessModal';
import ErrorModal from '@/components/ui/ErrorModal';
import { deleteAccount } from '@/services/authService';
import './DangerZone.css';

const DangerZone = ({ username }) => {
    const navigate = useNavigate();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            await deleteAccount();
            setShowDeleteModal(false);
            setShowSuccessModal(true);

            // Redirigir a la landing después de un breve delay
            setTimeout(() => {
                navigate('/', { replace: true });
            }, 4000);
        } catch (error) {
            setShowDeleteModal(false);
            setErrorMessage(
                error.response?.data?.message ||
                'Error al eliminar la cuenta. Por favor, inténtalo de nuevo.'
            );
            setShowErrorModal(true);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <div className="danger-zone">
                <div className="danger-zone__header">
                    <h2>⚠️ Zona de peligro</h2>
                    <p>Las acciones en esta sección son permanentes e irreversibles.</p>
                </div>

                <div className="danger-zone__content">
                    <div className="danger-zone__item">
                        <div className="danger-zone__item-info">
                            <h3>Eliminar mi cuenta</h3>
                            <p>
                                Elimina permanentemente tu cuenta y todos tus datos asociados.
                                Esta acción no se puede deshacer.
                            </p>
                        </div>
                        <Button
                            variant="danger"
                            onClick={() => setShowDeleteModal(true)}
                        >
                            Eliminar cuenta
                        </Button>
                    </div>
                </div>
            </div>

            <DeleteAccountModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteAccount}
                username={username}
                isLoading={isDeleting}
            />

            <SuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                title="Cuenta eliminada"
                message="Tu cuenta ha sido eliminada permanentemente. Serás redirigido a la página principal..."
            />

            <ErrorModal
                isOpen={showErrorModal}
                onClose={() => setShowErrorModal(false)}
                title="Error al eliminar"
                message={errorMessage}
            />
        </>
    );
};

export default DangerZone;
