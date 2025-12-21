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

import {
  getMyBeats,
  getBeatById,
} from "../../../../services/beatsService";

import { getCurrentUserId } from "../../../../services/authService";

import "./PlaylistDetails.css";

const PlaylistDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const myUserId = getCurrentUserId();

  const [playlist, setPlaylist] = useState(null);
  const [beats, setBeats] = useState([]);
  const [loading, setLoading] = useState(true);

  const [deleteModal, setDeleteModal] = useState(false);
  const [addBeatModal, setAddBeatModal] = useState(false);

  const [myBeats, setMyBeats] = useState([]);
  const [loadingBeats, setLoadingBeats] = useState(false);

  const [fixedWidth, setFixedWidth] = useState(null);

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
        if (playlist.beatsData?.length > 0) {
          const beatsWithAddedAt = playlist.items
            .map(item => {
              const beat = playlist.beatsData.find(
                b => b._id === item.beatId
              );
              return beat
                ? { ...beat, addedAt: item.addedAt }
                : null;
            })
            .filter(Boolean);

          setBeats(beatsWithAddedAt);
          return;
        }

        const fetchedBeats = await Promise.all(
          playlist.items.map(async item => {
            try {
              const beat = await getBeatById(item.beatId);
              return { ...beat, addedAt: item.addedAt };
            } catch {
              return null;
            }
          })
        );

        setBeats(fetchedBeats.filter(Boolean));
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

  const handleDeletePlaylist = async () => {
    try {
      await deletePlaylist(playlist._id);
      navigate("/app/playlists/me");
    } catch {
      alert("Error al eliminar la playlist");
    }
  };

  useEffect(() => {
    if (!addBeatModal || !playlist) return;

    const fetchMyBeats = async () => {
      setLoadingBeats(true);
      try {
        const beats = await getMyBeats();
        const existingIds = new Set(
          playlist.items.map(item => item.beatId)
        );

        setMyBeats(beats.filter(b => !existingIds.has(b._id)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingBeats(false);
      }
    };

    fetchMyBeats();
  }, [addBeatModal, playlist]);

  const handleAddBeat = async (beatId) => {
    try {
      const { data } = await addBeatToPlaylist(playlist._id, { beatId });
      setPlaylist(data);
      setAddBeatModal(false);
    } catch (err) {
      alert(err.response?.data?.message || "Error al añadir beat");
    }
  };

  const handleRemoveBeat = async (beatId) => {
    try {
      const { data } = await removeBeatFromPlaylist(
        playlist._id,
        beatId
      );
      setPlaylist(data);
    } catch {
      alert("Error al quitar el beat");
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
      style={
        fixedWidth
          ? { width: fixedWidth, maxWidth: fixedWidth }
          : {}
      }
    >
      {/* HEADER */}
      <div className="playlist-details-header">
        <div>
          <h1 className="playlist-title">{playlist.name}</h1>

          {playlist.description && (
            <p className="playlist-description">
              {playlist.description}
            </p>
          )}

          <div className="playlist-meta">
            <span>
              {playlist.isPublic ? "🌍 Pública" : "🔒 Privada"}
            </span>

            {playlist.collaboratorsData?.length > 0 && (
              <span>
                👥 {playlist.collaboratorsData.length} colaboradores
              </span>
            )}
          </div>
        </div>

        {canEditPlaylist && (
          <div className="playlist-actions">
            <Button
              onClick={() =>
                navigate(`/app/playlists/${playlist._id}/edit`)
              }
            >
              Editar playlist
            </Button>

            <IconButton
              variant="danger"
              onClick={() => setDeleteModal(true)}
            >
              🗑️
            </IconButton>
          </div>
        )}
      </div>

      {/* BEATS */}
      <div className="playlist-beats-wrapper">
        <div className="playlist-beats-header">
          <h2>Beats ({beats.length})</h2>

          {canEditPlaylist && (
            <Button onClick={() => setAddBeatModal(true)}>
              + Añadir beat
            </Button>
          )}
        </div>

        {beats.length === 0 ? (
          <div className="empty-state">
            Esta playlist aún no tiene beats
          </div>
        ) : (
          beats.map((beat, index) => (
            <Card
              key={beat._id || beat.beatId}
              className="playlist-beat-row"
              padding="none"
            >
              <div>{index + 1}</div>
              <div>
                <strong>{beat.title}</strong>
                <div className="text-muted">{beat.artist}</div>
              </div>
              <div>
                {new Date(beat.addedAt).toLocaleDateString()}
              </div>
              <img
                src={logo}
                alt="cover"
                className="beat-cover-small"
              />

              {canEditPlaylist && (
                <IconButton
                  variant="danger"
                  onClick={() =>
                    handleRemoveBeat(beat._id || beat.beatId)
                  }
                >
                  ❌
                </IconButton>
              )}
            </Card>
          ))
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
        <p>¿Seguro que quieres eliminar esta playlist?</p>
        <div className="modal-buttons">
          <button onClick={() => setDeleteModal(false)}>
            Cancelar
          </button>
          <button onClick={handleDeletePlaylist}>
            Borrar
          </button>
        </div>
      </Modal>

      {/* ADD BEAT MODAL */}
      <Modal
        isOpen={addBeatModal}
        onClose={() => setAddBeatModal(false)}
        title="Añadir beat a la playlist"
      >
        {loadingBeats ? (
          <p>Cargando beats...</p>
        ) : myBeats.length === 0 ? (
          <p>No tienes beats disponibles</p>
        ) : (
          myBeats.map(beat => (
            <div key={beat._id} className="add-beat-row">
              <div>
                <strong>{beat.title}</strong>
                <div className="text-muted">{beat.artist}</div>
              </div>
              <Button onClick={() => handleAddBeat(beat._id)}>
                Añadir
              </Button>
            </div>
          ))
        )}
      </Modal>
    </div>
  );
};

export default PlaylistDetails;
