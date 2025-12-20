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
} from "../../../../services/beats-interaction/playlistService";
import { getCurrentUserId } from "../../../../services/authService";
import "./PlaylistDetails.css";

const PlaylistDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [playlist, setPlaylist] = useState(null);
  const [beats, setBeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);

  const containerRef = useRef(null);
  const [fixedWidth, setFixedWidth] = useState(null);

  const myUserId = getCurrentUserId();

  useEffect(() => {
    const fetchPlaylist = async () => {
      setLoading(true);
      try {
        const response = await getPlaylistById(id);
        const detailedPlaylist = response.data;

        setPlaylist(detailedPlaylist);

        const beatsWithAddedAt = detailedPlaylist.items
          .map((item) => {
            const beat = detailedPlaylist.beatsData?.find(
              (b) => b.beatId === item.beatId
            );
            if (!beat) return null;

            return {
              ...beat,
              addedAt: item.addedAt,
            };
          })
          .filter(Boolean);

        setBeats(beatsWithAddedAt);
      } catch (error) {
        console.error("Error loading playlist:", error);
        navigate("/app/playlists/me");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPlaylist();
  }, [id, navigate]);

  useEffect(() => {
    const captureWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.getBoundingClientRect().width;
        setFixedWidth(width);
      }
    };

    const timer = setTimeout(captureWidth, 100);
    window.addEventListener("resize", captureWidth);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", captureWidth);
    };
  }, []);

  const handleDeletePlaylist = async () => {
    try {
      await deletePlaylist(playlist._id);
      setDeleteModal(false);
      navigate("/app/playlists/me");
    } catch (error) {
      console.error("Error deleting playlist:", error);
      alert("Error al eliminar la playlist");
    }
  };

  if (loading || !playlist) {
    return (
      <div className="flex-center" style={{ minHeight: "50vh" }}>
        <div className="text-xl text-muted">Cargando playlist...</div>
      </div>
    );
  }

  const isOwner = playlist.ownerId === myUserId;

  return (
    <div
      ref={containerRef}
      className="playlist-details-page"
      style={
        fixedWidth
          ? { width: `${fixedWidth}px`, maxWidth: `${fixedWidth}px` }
          : {}
      }
    >
      <div className="playlist-details-header">
        <div>
          <h1 className="playlist-title">{playlist.name}</h1>

          {playlist.description && (
            <p className="playlist-description">{playlist.description}</p>
          )}

          <div className="playlist-meta">
            <span className="playlist-privacy">
              {playlist.isPublic ? "🌍 Pública" : "🔒 Privada"}
            </span>

            {playlist.collaboratorsData?.length > 0 && (
              <span className="playlist-collabs">
                👥 {playlist.collaboratorsData.length} colaboradores
              </span>
            )}
          </div>
        </div>

        {isOwner && (
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
              title="Eliminar playlist"
            >
              🗑️
            </IconButton>
          </div>
        )}
      </div>

      <div className="playlist-beats-wrapper">
        <h2 className="playlist-section-title">
          Beats en esta playlist ({beats.length})
        </h2>

        <div className="playlist-beats-table-body">
          {beats.length === 0 ? (
            <div className="empty-state">
              Esta playlist aún no tiene beats
            </div>
          ) : (
            beats.map((beat, index) => (
              <Card
                key={beat.beatId}
                className="playlist-beat-row"
                padding="none"
              >
                <div className="playlist-beat-index">{index + 1}</div>

                <div className="playlist-beat-title">
                  <span className="beat-title-text">{beat.title}</span>
                  <span className="beat-artist-mobile">{beat.artist}</span>
                </div>

                <div className="playlist-beat-artist">{beat.artist}</div>

                <div className="playlist-beat-addedat">
                  {new Date(beat.addedAt).toLocaleDateString()}
                </div>

                <div className="playlist-beat-cover">
                  <img
                    src={logo}
                    alt="Cover"
                    className="beat-cover-small"
                  />
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      <ListComments isBeat={false} resourceId={playlist._id} />
      <ListRatings isBeat={false} resourceId={playlist._id} />

      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Eliminar playlist"
      >
        <p>¿Seguro que quieres eliminar esta playlist?</p>
        <div className="modal-buttons">
          <button
            className="modal-btn cancel"
            onClick={() => setDeleteModal(false)}
          >
            Cancelar
          </button>
          <button
            className="modal-btn delete"
            onClick={handleDeletePlaylist}
          >
            Borrar
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default PlaylistDetails;
