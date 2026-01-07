import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { upsertDirectConversation } from '@/services/messagingService';
import './SendMessageButton.css';

export default function SendMessageButton({
  otherUserId,
  otherUsername, // opcional
  label = 'Enviar mensaje',
  className = '',
}) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Sin userId no tiene sentido renderizar el botón
  if (!otherUserId) return null;

  async function handleClick() {
    if (loading) return;

    setLoading(true);
    try {
      const res = await upsertDirectConversation({ otherUserId });
      const conversationId = res?.conversation?._id;

      if (conversationId) {
        navigate(`/app/messages/${conversationId}`, {
          state: {
            otherUserId,
            otherUsername,
          },
        });
      }
    } catch (e) {
      console.error('Error al abrir o crear la conversación', e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      className={`sendMessageBtn ${className}`}
      onClick={handleClick}
      disabled={loading}
      aria-busy={loading}
    >
      {loading ? 'Abriendo…' : label}
    </button>
  );
}