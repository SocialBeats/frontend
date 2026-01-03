import { useEffect, useState, useRef } from "react";
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
import { searchBeats, getBeatById } from "../../../../services/beatsService";
import { getCurrentUserId } from "../../../../services/authService";
import ErrorModal from "../../../../components/ui/ErrorModal";
import "./PlaylistDetails.css";


const PlaylistDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const audioRef = useRef(null);

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

  const [currentPlayingId, setCurrentPlayingId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

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

  /* ================= AUDIO PLAYER ================= */

  const getAudioUrl = (beat) => {
    if (beat.audio?.s3Key) {
      const cdnDomain =
        window.RUNTIME_CONFIG?.VITE_CDN_DOMAIN ||
        import.meta.env.VITE_CDN_DOMAIN ||
        "";
      return `${cdnDomain}/${beat.audio.s3Key}`;
    }
    if (beat.audio?.url) return beat.audio.url;
    if (beat.audioUrl) return beat.audioUrl;
    return null;
  };

  const togglePlay = (beatId, beat) => {
    if (!audioRef.current) {
      console.error("Audio ref not available");
      return;
    }

    const audioUrl = getAudioUrl(beat);

    if (!audioUrl) {
      console.error("No audio URL found for beat:", beat);
      setErrorMessage("Audio no disponible para este beat");
      setErrorModalOpen(true);
      return;
    }

    if (currentPlayingId === beatId) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch((err) => {
          console.error("Error playing audio:", err);
          setErrorMessage("Error al reproducir el audio");
          setErrorModalOpen(true);
        });
        setIsPlaying(true);
      }
    } else {
      console.log("Loading audio from:", audioUrl);
      audioRef.current.src = audioUrl;
      audioRef.current
        .play()
        .then(() => {
          setCurrentPlayingId(beatId);
          setIsPlaying(true);
        })
        .catch((err) => {
          console.error("Error playing audio:", err);
          setErrorMessage("Error al reproducir el audio");
          setErrorModalOpen(true);
        });
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);

    const currentIndex = beats.findIndex((b) => b._id === currentPlayingId);
    if (currentIndex !== -1 && currentIndex < beats.length - 1) {
      const nextBeat = beats[currentIndex + 1];
      togglePlay(nextBeat._id, nextBeat);
    } else {
      setCurrentPlayingId(null);
    }
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

      if (currentPlayingId === beatId) {
        audioRef.current?.pause();
        setIsPlaying(false);
        setCurrentPlayingId(null);
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
      {/* Audio Element */}
      <audio
        ref={audioRef}
        onEnded={handleAudioEnded}
        onError={(e) => {
          console.error("Audio playback error:", e);
          setIsPlaying(false);
        }}
      />

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
          </div>
        </div>

        {playlist && (
          <div className="playlist-actions">
            { playlist && playlist.ownerId === myUserId  ? (
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
            const beatId = beat._id || beat.beatId;
            const itemId = beat.itemId;
            const isCurrentlyPlaying = currentPlayingId === beatId && isPlaying;
            const hasAudio = getAudioUrl(beat) !== null;

            return (
              <Card
                key={beatId}
                className={`playlist-beat-row ${
                  isCurrentlyPlaying ? "playing" : ""
                }`}
                padding="none"
              >
                {/* Play Button */}
                <IconButton
                  variant="ghost"
                  onClick={() => togglePlay(beatId, beat)}
                  disabled={!hasAudio}
                  title={hasAudio ? "Reproducir" : "Audio no disponible"}
                >
                  {isCurrentlyPlaying ? "⏸" : "▶"}
                </IconButton>

                <div>{index + 1}</div>

                <div>
                  <strong>{beat.title}</strong>
                  <div className="text-muted">{beat.artist}</div>
                </div>

                <div>{new Date(beat.addedAt).toLocaleDateString()}</div>

                <img src={logo} alt="cover" className="beat-cover-small" />

                {canEditPlaylist && (
                  <IconButton
                    variant="danger"
                    onClick={() => handleRemoveBeat(itemId, beatId)}
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