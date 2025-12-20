import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../../../../components/ui/Modal";
import "./PlaylistLists.css";
import {
  getMyPlaylists,
  deletePlaylist as deletePlaylistApi,
} from "../../../../services/beats-interaction/playlistService";

const MyPlaylists = () => {
  const navigate = useNavigate();

  const [playlists, setPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const response = await getMyPlaylists();

        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.playlists || [];

        setPlaylists(data);
      } catch (error) {
        console.error("Error loading playlists:", error);
        alert("No se pudieron cargar tus playlists");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylists();
  }, []);

  const handleOpenPlaylist = (id) => navigate(`/app/playlists/${id}`);

  const toggleMenu = (id, e) => {
    e.stopPropagation();
    setOpenMenuId(prev => (prev === id ? null : id));
  };

  const openDeleteModal = (id) => {
    setDeleteTarget(id);
    setOpenMenuId(null);
  };

  const confirmDeletePlaylist = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);

    const previousPlaylists = playlists;
    setPlaylists(prev =>
      prev.filter(pl => pl._id !== deleteTarget)
    );

    try {
      await deletePlaylistApi(deleteTarget);
      setDeleteTarget(null);
    } catch (error) {
      console.error("Error deleting playlist:", error);
      alert("No se pudo eliminar la playlist");

      setPlaylists(previousPlaylists);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <p className="loading-text">Cargando playlists...</p>;
  }

  return (
    <div className="playlist-list">
      <div className="playlist-list__container">
        <div className="playlist-list__header-row">
          <div>
            <h1 className="playlist-list__title">Tus Playlists</h1>
            <p className="playlist-list__subtitle">
              Lista de playlists creadas o compartidas contigo.
            </p>
          </div>

          <button
            className="btn-create-playlist"
            onClick={() => navigate("/app/playlists/create")}
          >
            + Crear Playlist
          </button>
        </div>

        {playlists.length === 0 ? (
          <p className="playlist-list__empty">
            Aún no tienes playlists
          </p>
        ) : (
          <div className="playlist-grid">
            {playlists.map(pl => (
              <div
                key={pl._id}
                className="playlist-card"
                onClick={() => handleOpenPlaylist(pl._id)}
              >
                <div className="playlist-card__top">
                  <div className="playlist-card__info">
                    <h2 className="playlist-card__name">{pl.name}</h2>
                    <p className="playlist-card__description">
                      {pl.description || "Sin descripción"}
                    </p>

                    {/* Badges */}
                    <div className="playlist-card__meta">
                      <span
                        className={`playlist-badge ${
                          pl.isPublic ? "public" : "private"
                        }`}
                      >
                        {pl.isPublic ? "🌍 Pública" : "🔒 Privada"}
                      </span>

                      {pl.collaborators?.length > 0 && (
                        <span className="playlist-badge collaborators">
                          👥 {pl.collaborators.length}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    className="playlist-card__menu-btn"
                    onClick={(e) => toggleMenu(pl._id, e)}
                  >
                    ⋮
                  </button>

                  {openMenuId === pl._id && (
                    <div
                      className="playlist-card__menu"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="playlist-card__menu-item"
                        onClick={() =>
                          navigate(`/app/playlists/${pl._id}/edit`)
                        }
                      >
                        ✏️ Editar
                      </button>

                      <button
                        className="playlist-card__menu-item delete"
                        onClick={() => openDeleteModal(pl._id)}
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal
          isOpen={deleteTarget !== null}
          onClose={() => !isDeleting && setDeleteTarget(null)}
          title="Eliminar playlist"
        >
          <p>¿Seguro que quieres eliminar esta playlist?</p>
          <div className="modal-buttons">
            <button
              className="modal-btn cancel"
              disabled={isDeleting}
              onClick={() => setDeleteTarget(null)}
            >
              Cancelar
            </button>

            <button
              className="modal-btn delete"
              disabled={isDeleting}
              onClick={confirmDeletePlaylist}
            >
              {isDeleting ? "Borrando..." : "Borrar"}
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default MyPlaylists;
