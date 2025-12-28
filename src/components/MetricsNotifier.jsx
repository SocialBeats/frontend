import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from './ui/ConfirmModal';
import { getMyBeats } from '../services/beatsService';

const POLL_INTERVAL = 10000; // 10s

export default function MetricsNotifier() {
  const navigate = useNavigate();
  const prevStatusesRef = useRef(new Map());
  const notifiedRef = useRef(new Map()); // id -> timestamp
  const [modalOpen, setModalOpen] = useState(false);
  const [modalBeat, setModalBeat] = useState(null);

  useEffect(() => {
    let mounted = true;

    // Load previously notified beat IDs from localStorage (with expiry) to avoid re-notifying
    try {
      const stored = localStorage.getItem('notifiedMetricsBeats');
      if (stored) {
        const obj = JSON.parse(stored);
        const now = Date.now();
        const expiryMs = 24 * 60 * 60 * 1000; // 24h
        Object.entries(obj || {}).forEach(([id, ts]) => {
          if (now - ts < expiryMs) notifiedRef.current.set(id, ts);
        });
      }
    } catch (err) {
      // ignore
    }

    const checkBeats = async () => {
      try {
        const beats = await getMyBeats();
        if (!mounted || !Array.isArray(beats)) return;

        for (const beat of beats) {
          // skip if we've already notified for this beat recently
          if (notifiedRef.current.has(beat._id)) {
            prevStatusesRef.current.set(beat._id, beat.metrics?.status || 'pending');
            continue;
          }
          const prev = prevStatusesRef.current.get(beat._id);
          const cur = beat.metrics?.status || 'pending';

          // If previously wasn't 'done' and now is 'done', notify user
          if (prev && prev !== 'done' && cur === 'done') {
            // Record the new 'done' status immediately to avoid re-notifying
            prevStatusesRef.current.set(beat._id, cur);

            // mark as notified in memory + localStorage with timestamp so we don't re-notify
            const now = Date.now();
            notifiedRef.current.set(beat._id, now);
            try {
              const prev = JSON.parse(localStorage.getItem('notifiedMetricsBeats') || '{}');
              prev[beat._id] = now;
              localStorage.setItem('notifiedMetricsBeats', JSON.stringify(prev));
            } catch (err) {
              // ignore storage errors
            }

            // show modal for this beat (only if not already open)
            if (!modalOpen) {
              setModalBeat(beat);
              setModalOpen(true);
            }
            break; // show one at a time
          }

          // store current status
          prevStatusesRef.current.set(beat._id, cur);
        }
      } catch (err) {
        // Silently ignore polling errors; could add logging
      }
    };

    // Initial load to populate previous statuses
    (async () => {
      try {
        const beats = await getMyBeats();
        if (Array.isArray(beats)) {
          beats.forEach((b) => prevStatusesRef.current.set(b._id, b.metrics?.status || 'pending'));
        }
      } catch (err) {
        // ignore
      }
    })();

    const id = setInterval(checkBeats, POLL_INTERVAL);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  const handleClose = () => {
    setModalOpen(false);
    setModalBeat(null);
  };

  const handleConfirm = async () => {
    if (!modalBeat) return handleClose();

    // Navigate to create dashboards with beat preselected via query param
    navigate(`/app/dashboards/create?beatId=${modalBeat._id}`);
    handleClose();
  };

  return (
    <ConfirmModal
      isOpen={modalOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
      title="Métricas calculadas"
      message={modalBeat ? `Métricas del beat "${modalBeat.title}" calculadas. ¿Quieres crear tu dashboard?` : ''}
      confirmText="Sí, crear"
      cancelText="No, gracias"
    />
  );
}
