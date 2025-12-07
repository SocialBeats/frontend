import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Modal from "../../../../components/ui/Modal";
import Card from "../../../../components/ui/Card";
import IconButton from "../../../../components/ui/IconButton";
import Button from "../../../../components/ui/Button";
import logo from "../../../../assets/logo-dark-no-fondo.png";
import ListComments from "../comment/ListComments";
import "./PlaylistDetails.css";

// --- Datos mock ---
const mockBeats = [
  { _id: "1", title: "Beat One", artist: "Artista A" },
  { _id: "2", title: "Beat Two", artist: "Artista B" },
  { _id: "3", title: "Beat Three", artist: "Artista C" },
  { _id: "4", title: "Beat Four", artist: "Artista D" },
];

const mockPlaylist = {
  _id: "42",
  name: "Mi playlist favorita",
  description: "Beats que me gustan para trabajar y producir",
  isPublic: true,
  collaborators: ["User1", "User2"],
  items: [
    { beatId: "1", addedAt: new Date() },
    { beatId: "3", addedAt: new Date() },
    { beatId: "4", addedAt: new Date() },
  ],
};

// --- Componente ---
const PlaylistDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [playlist, setPlaylist] = useState(null);
  const [beats, setBeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);

  const containerRef = useRef(null);
  const [fixedWidth, setFixedWidth] = useState(null);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setPlaylist(mockPlaylist);

      const beatsInPlaylist = mockPlaylist.items.map((item) => {
        const beat = mockBeats.find((b) => b._id === item.beatId);
        return {
          ...beat,
          addedAt: item.addedAt,
        };
      });

      setBeats(beatsInPlaylist);
      setLoading(false);
    }, 300);
  }, [id]);

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

  const deletePlaylist = () => {
    console.log("Deleting playlist:", playlist._id);
    setDeleteModal(false);
    navigate("/app/playlists");
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
      style={fixedWidth ? { width: `${fixedWidth}px`, maxWidth: `${fixedWidth}px` } : {}}
    >
      {/* Header */}
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
            {playlist.collaborators.length > 0 && (
              <span className="playlist-collabs">
                👥 {playlist.collaborators.length} colaboradores
              </span>
            )}
          </div>
        </div>

        <div className="playlist-actions">
          <Button onClick={() => navigate(`/app/playlists/${playlist._id}/edit`)}>
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
      </div>

      {/* Beats list */}
      <div className="playlist-beats-wrapper">
        <h2 className="playlist-section-title">
          Beats en esta playlist ({beats.length})
        </h2>

        <div className="playlist-beats-table-body">
          {beats.map((beat, index) => (
            <Card key={beat._id} className="playlist-beat-row" padding="none">
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
                <img src={logo} alt="Cover" className="beat-cover-small" />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Comments section */}
      <ListComments isBeat={false} resourceId={playlist._id} />

      {/* Delete modal */}
      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Eliminar playlist"
      >
        <p>¿Seguro que quieres eliminar esta playlist?</p>
        <div className="modal-buttons">
          <button className="modal-btn cancel" onClick={() => setDeleteModal(false)}>
            Cancelar
          </button>
          <button className="modal-btn delete" onClick={deletePlaylist}>
            Borrar
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default PlaylistDetails;
