import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import {
  listReceivedRequests,
  respondRequest,
} from '@/services/social/friendshipsService';
import './FriendRequests.css';

// Obtiene un id estable del objeto solicitud
const getRequestId = (request) => request?.id || request?._id || request;

const getSenderName = (request) => {
  const sender = request?.sender || request?.requester || request?.from;
  // Priorizar username, luego name, luego alias
  // Solo usar ID como último recurso si todo lo anterior es vacío/nulo
  return (sender?.username?.trim() || sender?.name?.trim() || sender?.alias?.trim() || 'Usuario desconocido');
};

const getSender = (request) => request?.sender || request?.requester || request?.from;

function RequestRow({ request, onAccept, onReject, isProcessing }) {
  const requestId = getRequestId(request);
  const sender = getSender(request);
  const senderName = getSenderName(request);

  return (
    <li className="request-row" role="listitem">
      <div className="request-row-left">
        <Avatar 
          size="medium" 
          fallback={senderName?.[0]?.toUpperCase()} 
          alt={senderName}
        />
        <div className="request-row-text">
          <span className="request-row-name">{senderName}</span>
          {/* {sender?.full_name && <span className="request-row-sub">{sender.full_name}</span>} */}
          {request?.createdAt && (
            <span className="request-row-date">
              {new Date(request.createdAt).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </span>
          )}
        </div>
      </div>
      <div className="request-row-actions">
        <Button
          variant="primary"
          size="small"
          aria-label={`Aceptar solicitud de ${senderName}`}
          onClick={() => onAccept(request)}
          disabled={isProcessing}
        >
          {isProcessing === 'accept' ? 'Aceptando…' : 'Aceptar'}
        </Button>
        <Button
          variant="secondary"
          size="small"
          aria-label={`Rechazar solicitud de ${senderName}`}
          onClick={() => onReject(request)}
          disabled={isProcessing}
        >
          {isProcessing === 'reject' ? 'Rechazando…' : 'Rechazar'}
        </Button>
      </div>
    </li>
  );
}

function RequestSkeleton() {
  return (
    <li className="request-row" role="listitem" aria-busy="true">
      <div className="request-row-left">
        <div className="skeleton avatar-medium" />
        <div className="request-row-text">
          <div className="skeleton line short" />
          <div className="skeleton line" />
          <div className="skeleton line tiny" />
        </div>
      </div>
      <div className="request-row-actions">
        <div className="skeleton btn" />
        <div className="skeleton btn" />
      </div>
    </li>
  );
}

export default function FriendRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [processingAction, setProcessingAction] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const showToast = (type, message) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ type, message });
    toastTimerRef.current = setTimeout(() => setToast(null), 3200);
  };

  const loadRequests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listReceivedRequests();
      // API puede devolver: { value: [...], Count: n } o directamente [...] o { requests: [...] }
      setRequests(data?.requests || data?.value || data || []);
    } catch (err) {
      setError('No se pudieron cargar las solicitudes de amistad.');
      showToast('error', 'No se pudieron cargar las solicitudes.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return requests;
    return requests.filter((r) => getSenderName(r)?.toLowerCase().includes(term));
  }, [requests, search]);

  const handleAccept = async (request) => {
    const requestId = getRequestId(request);
    const senderName = getSenderName(request);

    const snapshot = [...requests];
    setProcessingId(requestId);
    setProcessingAction('accept');
    setRequests((prev) => prev.filter((r) => getRequestId(r) !== requestId));

    try {
      await respondRequest(requestId, 'accept');
      showToast('success', `¡Ahora eres amigo de ${senderName}!`);
    } catch (err) {
      setRequests(snapshot);
      setError('No se pudo aceptar la solicitud.');
      showToast('error', 'No se pudo aceptar la solicitud.');
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  const handleReject = async (request) => {
    const requestId = getRequestId(request);
    const senderName = getSenderName(request);

    const snapshot = [...requests];
    setProcessingId(requestId);
    setProcessingAction('reject');
    setRequests((prev) => prev.filter((r) => getRequestId(r) !== requestId));

    try {
      await respondRequest(requestId, 'reject');
      showToast('success', `Solicitud de ${senderName} rechazada.`);
    } catch (err) {
      setRequests(snapshot);
      setError('No se pudo rechazar la solicitud.');
      showToast('error', 'No se pudo rechazar la solicitud.');
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <ul className="requests-list" role="list" aria-busy="true">
          {Array.from({ length: 3 }).map((_, idx) => (
            <RequestSkeleton key={idx} />
          ))}
        </ul>
      );
    }

    if (error) {
      return (
        <Card className="state-card error">
          <p>{error}</p>
          <Button variant="secondary" onClick={loadRequests}>Reintentar</Button>
        </Card>
      );
    }

    if (!filtered.length) {
      return (
        <Card className="state-card empty">
          <p>{requests.length === 0 
            ? 'No tienes solicitudes de amistad pendientes.' 
            : 'No se encontraron solicitudes con ese nombre.'}
          </p>
          <Button variant="primary" onClick={() => navigate('/app/friends')}>
            Ver mis amigos
          </Button>
        </Card>
      );
    }

    return (
      <ul className="requests-list" role="list">
        {filtered.map((request) => {
          const reqId = getRequestId(request);
          return (
            <RequestRow
              key={reqId}
              request={request}
              onAccept={handleAccept}
              onReject={handleReject}
              isProcessing={processingId === reqId ? processingAction : null}
            />
          );
        })}
      </ul>
    );
  };

  return (
    <div className="friend-requests-page">
      <header className="requests-header">
        <div>
          <h1>Solicitudes de Amistad</h1>
          <p className="requests-sub">
            {requests.length > 0 
              ? `Tienes ${requests.length} solicitud${requests.length !== 1 ? 'es' : ''} pendiente${requests.length !== 1 ? 's' : ''}`
              : 'No tienes solicitudes pendientes'}
          </p>
        </div>
        <div className="requests-actions">
          {requests.length > 0 && (
            <Input
              aria-label="Buscar solicitudes"
              placeholder="Buscar por nombre"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              fullWidth
            />
          )}
        </div>
      </header>

      <main className="requests-main">
        {renderContent()}
      </main>

      {toast && (
        <div 
          className={`toast toast-${toast.type}`}
          role="alert"
          aria-live="polite"
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
