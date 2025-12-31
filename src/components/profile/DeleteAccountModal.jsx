import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import './DeleteAccountModal.css';

const DeleteAccountModal = ({
    isOpen,
    onClose,
    onConfirm,
    username,
    isLoading = false,
}) => {
    const [confirmInput, setConfirmInput] = useState('');

    const isConfirmValid = confirmInput === username;

    const handleConfirm = async () => {
        if (!isConfirmValid) return;
        await onConfirm();
    };

    const handleClose = () => {
        setConfirmInput('');
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="⚠️ Eliminar cuenta"
            showCloseButton={!isLoading}
            size="medium"
        >
            <div className="delete-account-modal">
                <div className="delete-account-modal__warning">
                    <div className="delete-account-modal__icon">🗑️</div>
                    <h3>Esta acción es irreversible</h3>
                    <p>
                        Estás a punto de eliminar tu cuenta de <strong>SocialBeats</strong> de forma permanente.
                    </p>
                </div>

                <div className="delete-account-modal__info">
                    <h4>¿Qué se eliminará?</h4>
                    <ul>
                        <li>📋 Tu perfil y toda tu información personal</li>
                        <li>🎵 Todos tus beats subidos</li>
                        <li>👥 Tus seguidores y seguidos</li>
                        <li>💬 Tus comentarios y likes</li>
                        <li>📊 Tus playlists y favoritos</li>
                        <li>💳 Tu historial de transacciones</li>
                    </ul>
                </div>

                <div className="delete-account-modal__confirm">
                    <p>
                        Para confirmar, escribe tu nombre de usuario: <strong>{username}</strong>
                    </p>
                    <Input
                        type="text"
                        value={confirmInput}
                        onChange={(e) => setConfirmInput(e.target.value)}
                        placeholder={`Escribe "${username}" para confirmar`}
                        disabled={isLoading}
                        autoComplete="off"
                    />
                </div>

                <div className="delete-account-modal__actions">
                    <Button
                        onClick={handleClose}
                        variant="secondary"
                        disabled={isLoading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        variant="danger"
                        disabled={!isConfirmValid || isLoading}
                    >
                        {isLoading ? 'Eliminando...' : 'Eliminar mi cuenta permanentemente'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default DeleteAccountModal;
