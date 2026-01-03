import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Modal from "../../../../components/ui/Modal";
import Card from "../../../../components/ui/Card";
import IconButton from "../../../../components/ui/IconButton";
import Button from "../../../../components/ui/Button";
import logo from "../../../../assets/logo-dark-no-fondo.png";
import ListComments from "../comment/ListComments";
import ListRatings from "../rating/ListRatings";
import {
  getPlaylistById,
  deletePlaylist,
  addBeatToPlaylist,
  removeBeatFromPlaylist,
} from "../../../../services/beats-interaction/playlistService";
import { createPlaylistModerationReport } from "../../../../services/beats-interaction/moderationReportService.js";
import { searchBeats, getBeatById, getAudioStreamUrl, getBatchSignedUrls } from "../../../../services/beatsService";
import { getCurrentUserId } from "../../../../services/authService";
import ErrorModal from "../../../../components/ui/ErrorModal";
import { usePlayerStore } from "../../../../store/usePlayerStore";
import "./PlaylistDetails.css";


const PlaylistDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  // Global Player Store
  const {
    currentBeat,
    isPlaying: globalIsPlaying,
    play: globalPlay,
    pause: globalPause,
    queue: globalQueue
  } = usePlayerStore();

  const myUserId = getCurrentUserId();

  const [playlist, setPlaylist] = useState(null);
  const [beats, setBeats] = useState([]);
  const [loading, setLoading] = useState(true);

  const [deleteModal, setDeleteModal] = useState(false);
  const [addBeatModal, setAddBeatModal] = useState(false);

  const [searchResults, setSearchResults] = useState([]);
  const [loadingBeats, setLoadingBeats] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [fixedWidth, setFixedWidth] = useState(null);

  // Cache de URLs firmadas para los beats de la playlist
  const [signedUrlsCache, setSignedUrlsCache] = useState({});
  const [loadingUrls, setLoadingUrls] = useState(false);

  const [reportModalOpen, setReportModalOpen] = useState(false);

  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /* ================= FETCH PLAYLIST ================= */

  useEffect(() => {
    const fetchPlaylist = async () => {
      setLoading(true);
      try {
        const { data } = await getPlaylistById(id);
        setPlaylist(data);
      } catch (err) {
        console.error(err);
        navigate("/app/playlists/me");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPlaylist();
  }, [id, navigate]);

  useEffect(() => {
    if (!playlist) return;

    const loadBeats = async () => {
      try {
        if (Array.isArray(playlist.beatsData) && playlist.beatsData.length > 0) {
          const beatsWithAddedAt = playlist.items
            .map((item) => {
              const beat = playlist.beatsData.find((b) => b._id === item.beatId || b.beatId === item.beatId);
              return beat ? { ...beat, addedAt: item.addedAt, itemId: item.beatId } : null;
            })
            .filter(Boolean);

          setBeats(beatsWithAddedAt);
          return;
        }

        // Si beatsData está vacío o no existe, fetch individual de cada beat
        if (Array.isArray(playlist.items) && playlist.items.length > 0) {
          const fetchedBeats = await Promise.all(
            playlist.items.map(async (item) => {
              try {
                const beat = await getBeatById(item.beatId);
                return { ...beat, addedAt: item.addedAt, itemId: item.beatId };
              } catch {
                return null;
              }
            })
          );

          setBeats(fetchedBeats.filter(Boolean));
        } else {
          setBeats([]);
        }
      } catch (err) {
        console.error("Error loading beats:", err);
        setBeats([]);
      }
    };

    loadBeats();
  }, [playlist]);

  const canEditPlaylist =
    playlist &&
    (playlist.ownerId === myUserId ||
      playlist.collaborators?.includes(myUserId));

  useEffect(() => {
    const captureWidth = () => {
      if (containerRef.current) {
        setFixedWidth(containerRef.current.getBoundingClientRect().width);
      }
    };
    captureWidth();
    window.addEventListener("resize", captureWidth);
    return () => window.removeEventListener("resize", captureWidth);
  }, []);

  /* ================= GLOBAL PLAYER INTEGRATION ================= */

  // Helper para obtener el ID correcto del beat para llamadas al API
  // beatsData viene de BeatMaterialized que tiene beatId (ID original del microservicio beats-upload)
  const getBeatApiId = (beat) => {
    // Priorizar beatId (ID del microservicio beats-upload) sobre _id (ID de la materialized view)
    return beat.beatId || beat._id;
  };

  // Pre-cargar URLs firmadas para todos los beats de la playlist (usando batch)
  useEffect(() => {
    if (beats.length === 0) return;

    const preloadSignedUrls = async () => {
      setLoadingUrls(true);

      // Obtener IDs de beats que no están en caché local
      const beatIds = beats
        .map(beat => getBeatApiId(beat))
        .filter(id => !signedUrlsCache[id]);

      if (beatIds.length === 0) {
        setLoadingUrls(false);
        console.log('📦 All URLs already cached locally');
        return;
      }

      try {
        // Usar batch endpoint (máx 10 por petición, el servicio lo maneja)
        console.log('🔄 Batch fetching signed URLs for', beatIds.length, 'beats');
        const batchUrls = await getBatchSignedUrls(beatIds);

        // Actualizar caché local con los resultados
        setSignedUrlsCache(prev => ({ ...prev, ...batchUrls }));
        console.log('✅ Pre-loaded signed URLs for', Object.keys(batchUrls).length, 'beats');
      } catch (error) {
        console.warn('⚠️ Batch URL fetch failed:', error);
      } finally {
        setLoadingUrls(false);
      }
    };

    preloadSignedUrls();
  }, [beats]);

  // Helper para obtener la cover URL firmada de un beat
  const getSignedCoverUrl = (beat) => {
    const apiId = getBeatApiId(beat);
    const cached = signedUrlsCache[apiId];
    if (cached?.coverUrl) return cached.coverUrl;
    return logo; // Fallback al logo si no hay cover
  };

  // Convertir beat de playlist al formato del store
  // Usamos beatId (ID original) como identificador único en el store
  const mapBeatToStoreFormat = useCallback((beat, streamUrl, coverUrl) => {
    const apiId = getBeatApiId(beat);
    return {
      ...beat,
      id: apiId, // Usar el ID del API para consistencia
      title: beat.title,
      author: beat.createdBy?.username || beat.artist || 'Unknown',
      cover: coverUrl || logo,
      audio: {
        url: streamUrl,
        coverUrl: coverUrl || logo,
        duration: beat.duration
      }
    };
  }, []);

  // Construir la cola de reproducción con URLs firmadas
  const buildPlaylistQueue = useCallback(async () => {
    const queueBeats = [];

    for (const beat of beats) {
      const apiId = getBeatApiId(beat);
      let cached = signedUrlsCache[apiId];

      // Si no está en cache, intentar obtenerla
      if (!cached) {
        try {
          const { streamUrl, coverUrl } = await getAudioStreamUrl(apiId);
          cached = { streamUrl, coverUrl };
          setSignedUrlsCache(prev => ({ ...prev, [apiId]: cached }));
        } catch (error) {
          console.warn(`⚠️ Could not get URL for beat ${apiId}, skipping`);
          continue;
        }
      }

      queueBeats.push(mapBeatToStoreFormat(beat, cached.streamUrl, cached.coverUrl));
    }

    return queueBeats;
  }, [beats, signedUrlsCache, mapBeatToStoreFormat]);

  // Reproducir un beat específico de la playlist
  const handlePlayBeat = async (beat) => {
    const apiId = getBeatApiId(beat);

    // Verificar si este beat ya está reproduciéndose
    const isThisBeatActive = currentBeat?.id === apiId;

    if (isThisBeatActive) {
      // Solo toggle play/pause
      if (globalIsPlaying) {
        globalPause();
      } else {
        // Si pausamos, solo necesitamos hacer play de nuevo
        const cached = signedUrlsCache[apiId];
        if (cached?.streamUrl) {
          globalPlay(mapBeatToStoreFormat(beat, cached.streamUrl, cached.coverUrl));
        }
      }
      return;
    }

    // Nuevo beat - construir cola y reproducir
    try {
      let cached = signedUrlsCache[apiId];

      // Si no tenemos la URL, obtenerla
      if (!cached) {
        console.log('🔄 Fetching signed URLs for beat:', apiId);
        const { streamUrl, coverUrl } = await getAudioStreamUrl(apiId);
        cached = { streamUrl, coverUrl };
        setSignedUrlsCache(prev => ({ ...prev, [apiId]: cached }));
      }

      // Construir la cola completa de la playlist
      const playlistQueue = await buildPlaylistQueue();

      // Encontrar el beat actual en la cola
      const beatForStore = mapBeatToStoreFormat(beat, cached.streamUrl, cached.coverUrl);

      // Reproducir con la cola
      globalPlay(beatForStore, playlistQueue);
      console.log('▶️ Playing beat from playlist with queue of', playlistQueue.length, 'beats');

    } catch (error) {
      console.error('❌ Error playing beat:', error);
      setErrorMessage("Error al reproducir el audio");
      setErrorModalOpen(true);
    }
  };

  // Verificar si un beat específico está activo y reproduciéndose
  // Usamos getBeatApiId para comparar con el ID del store
  const isBeatPlaying = (beat) => {
    const apiId = getBeatApiId(beat);
    return currentBeat?.id === apiId && globalIsPlaying;
  };

  const isBeatActive = (beat) => {
    const apiId = getBeatApiId(beat);
    return currentBeat?.id === apiId;
  };

  /* ================= PLAYLIST ACTIONS ================= */

  const handleDeletePlaylist = async () => {
    try {
      await deletePlaylist(playlist._id);
      navigate("/app/playlists/me");
    } catch {
      setErrorMessage("Error al eliminar la playlist");
      setErrorModalOpen(true);
    }
  };

  useEffect(() => {
    if (!addBeatModal) {
      setSearchQuery("");
      setSearchResults([]);
      return;
    }
  }, [addBeatModal]);

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const delaySearch = setTimeout(async () => {
      setLoadingBeats(true);
      try {
        const results = await searchBeats(searchQuery);
        const existingIds = new Set(playlist.items.map((item) => item.beatId));
        setSearchResults(results.filter((b) => !existingIds.has(b._id)));
      } catch (err) {
        console.error("Error searching beats:", err);
        setSearchResults([]);
      } finally {
        setLoadingBeats(false);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchQuery, playlist]);

  const handleAddBeat = async (beatId) => {
    try {
      const { data } = await addBeatToPlaylist(playlist._id, { beatId });
      setPlaylist(data);
      setAddBeatModal(false);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Error al añadir beat");
      setErrorModalOpen(true);
    }
  };

  const handleRemoveBeat = async (itemId, beatId) => {
    try {
      const { data } = await removeBeatFromPlaylist(playlist._id, itemId);
      setPlaylist(data);

      // Limpiar URL del cache
      setSignedUrlsCache(prev => {
        const newCache = { ...prev };
        delete newCache[beatId];
        return newCache;
      });

      // Si el beat eliminado estaba reproduciéndose, pausar
      if (currentBeat?.id === beatId) {
        globalPause();
      }
    } catch {
      setErrorMessage("Error al quitar el beat");
      setErrorModalOpen(true);
    }
  };

  /* ================= REPORT PLAYLIST ================= */

  const openReportModal = () => {
    if (!playlist?._id) return;
    if (canEditPlaylist) return; // owner o colaborador => NO puede denunciar
    setReportModalOpen(true);
  };

  const closeReportModal = () => {
    setReportModalOpen(false);
  };

  const handleConfirmReport = async () => {
    if (!playlist?._id) return;
    if (canEditPlaylist) return;

    try {
      await createPlaylistModerationReport(playlist._id);
      alert("Denuncia enviada con éxito");

      closeReportModal();
    } catch (err) {
      console.error(err);
      setErrorMessage("Error denunciando playlist");
      setErrorModalOpen(true);
      closeReportModal();
    }
  };

  if (loading || !playlist) {
    return (
      <div className="flex-center" style={{ minHeight: "50vh" }}>
        <div className="text-xl text-muted">Cargando playlist...</div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="playlist-details-page"
      style={fixedWidth ? { width: fixedWidth, maxWidth: fixedWidth } : {}}
    >
      {/* HEADER */}
      <div className="playlist-details-header">
        <div>
          <h1 className="playlist-title">{playlist.name}</h1>

          {playlist.description && (
            <p className="playlist-description">{playlist.description}</p>
          )}

          <div className="playlist-meta">
            <span>{playlist.isPublic ? "🌍 Pública" : "🔒 Privada"}</span>

            {playlist.collaboratorsData?.length > 0 && (
              <span>👥 {playlist.collaboratorsData.length} colaboradores</span>
            )}

            {loadingUrls && (
              <span className="text-muted">🔄 Cargando audio...</span>
            )}
          </div>
        </div>

        {playlist && (
          <div className="playlist-actions">
            {playlist && playlist.ownerId === myUserId ? (
              <>
                <IconButton
                  variant="ghost"
                  onClick={() =>
                    navigate(`/app/playlists/${playlist._id}/edit`)
                  }
                >
                  ✏️
                </IconButton>

                <IconButton
                  variant="ghost"
                  onClick={() => setDeleteModal(true)}
                >
                  🗑️
                </IconButton>
              </>
            ) : (
              <Button
                variant="danger"
                onClick={openReportModal}
                title="Denunciar playlist"
              >
                Denunciar
              </Button>
            )}
          </div>
        )}
      </div>

      {/* BEATS */}
      <div className="playlist-beats-wrapper">
        <div className="playlist-beats-header">
          <h2>Beats ({beats.length})</h2>

          {canEditPlaylist && (
            <Button onClick={() => setAddBeatModal(true)}>+ Añadir beat</Button>
          )}
        </div>

        {beats.length === 0 ? (
          <div className="empty-state">Esta playlist aún no tiene beats</div>
        ) : (
          beats.map((beat, index) => {
            const apiId = getBeatApiId(beat);
            const itemId = beat.itemId;
            const isCurrentlyPlaying = isBeatPlaying(beat);
            const isActive = isBeatActive(beat);
            const hasSignedUrl = !!signedUrlsCache[apiId]?.streamUrl;

            return (
              <Card
                key={apiId}
                className={`playlist-beat-row ${isCurrentlyPlaying ? "playing" : ""} ${isActive ? "active" : ""}`}
                padding="none"
              >
                {/* Play Button */}
                <IconButton
                  variant="ghost"
                  onClick={() => handlePlayBeat(beat)}
                  title={hasSignedUrl ? "Reproducir" : "Cargando..."}
                >
                  {isCurrentlyPlaying ? "⏸" : "▶"}
                </IconButton>

                <div>{index + 1}</div>

                <div>
                  <strong>{beat.title}</strong>
                  <div className="text-muted">{beat.createdBy?.username || beat.artist}</div>
                </div>

                <div>{new Date(beat.addedAt).toLocaleDateString()}</div>

                <img
                  src={getSignedCoverUrl(beat)}
                  alt="cover"
                  className="beat-cover-small"
                  onError={(e) => { e.target.src = logo; }}
                />

                {canEditPlaylist && (
                  <IconButton
                    variant="danger"
                    onClick={() => handleRemoveBeat(itemId, apiId)}
                  >
                    ❌
                  </IconButton>
                )}
              </Card>
            );
          })
        )}
      </div>

      <ListComments isBeat={false} resourceId={playlist._id} />
      <ListRatings isBeat={false} resourceId={playlist._id} />

      {/* DELETE MODAL */}
      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Eliminar playlist"
      >
        <div className="comment-delete-modal">
          <p>¿Seguro que quieres eliminar esta playlist?</p>
          <div className="modal-buttons">
            <Button variant="primary" onClick={() => setDeleteModal(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDeletePlaylist}>
              Borrar
            </Button>
          </div>
        </div>
      </Modal>

      {/* REPORT MODAL */}
      <Modal
        isOpen={reportModalOpen}
        onClose={closeReportModal}
        title="Denunciar playlist"
      >
        <div className="comment-delete-modal">
          <p>
            ¿Estás seguro que quieres denunciar esta playlist por contenido
            inapropiado?
          </p>
          <div className="modal-buttons">
            <Button variant="primary" onClick={closeReportModal}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleConfirmReport}>
              Denunciar
            </Button>
          </div>
        </div>
      </Modal>

      {/* ADD BEAT MODAL */}
      <Modal
        isOpen={addBeatModal}
        onClose={() => setAddBeatModal(false)}
        title="Añadir beat a la playlist"
      >
        <div className="search-beats-modal">
          <input
            type="text"
            placeholder="Buscar beats por título, artista o género..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            autoFocus
          />

          {loadingBeats ? (
            <p>Buscando beats...</p>
          ) : searchQuery.length < 2 ? (
            <p className="text-muted">Escribe al menos 2 caracteres para buscar</p>
          ) : searchResults.length === 0 ? (
            <p>No se encontraron beats</p>
          ) : (
            <div className="search-results">
              {searchResults.map((beat) => (
                <div key={beat._id} className="add-beat-row">
                  <div>
                    <strong>{beat.title}</strong>
                    <div className="text-muted">{beat.artist}</div>
                  </div>
                  <Button onClick={() => handleAddBeat(beat._id)}>Añadir</Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      <ErrorModal
        isOpen={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        message={errorMessage}
      />
    </div>
  );
};

export default PlaylistDetails;