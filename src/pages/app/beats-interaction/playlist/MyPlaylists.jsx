import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../../../../components/ui/Modal";
import "./PlaylistLists.css";

// Mock playlists for now
const mockPlaylists = [
  {
    id: 42,
    name: "Favoritas 2024",
    description: "Mis canciones más escuchadas del año.",
  },
  {
    id: 2,
    name: "Beats para trabajar",
    description: "Playlist perfecta para concentrarse.",
  },
  {
    id: 3,
    name: "Reggaeton Old School",
    description: "Clásicos de reggaeton del 2000 al 2010.",
  },
];

const MyPlaylists = () => {
  const navigate = useNavigate();
  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleOpenPlaylist = (id) => {
    navigate(`/app/playlists/${id}`);
  };

  const toggleMenu = (id, e) => {
    e.stopPropagation();
    setOpenMenuId((prev) => (prev === id ? null : id));
  };

  const openDeleteModal = (id) => {
    setDeleteTarget(id);
    setOpenMenuId(null);
  };

  const deletePlaylist = () => {
    console.log("Deleting playlist:", deleteTarget);
    // Aquí iría la llamada a la API para borrar la playlist
    setDeleteTarget(null);
  };

  return (
    <div className="playlist-list">
      <div className="playlist-list__container">
        <h1 className="playlist-list__title">Tus Playlists</h1>
        <p className="playlist-list__subtitle">
          Lista de playlists creadas o compartidas contigo.
        </p>

        <div className="playlist-grid">
          {mockPlaylists.map((pl) => (
            <div
              key={pl.id}
              className="playlist-card"
              onClick={() => handleOpenPlaylist(pl.id)}
            >
              {/* Header & Menu */}
              <div className="playlist-card__top">
                <div>
                  <h2 className="playlist-card__name">{pl.name}</h2>
                  <p className="playlist-card__description">
                    {pl.description || "Sin descripción"}
                  </p>
                </div>

                <button
                  className="playlist-card__menu-btn"
                  onClick={(e) => toggleMenu(pl.id, e)}
                >
                  ⋮
                </button>

                {openMenuId === pl.id && (
                  <div
                    className="playlist-card__menu"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="playlist-card__menu-item"
                      onClick={() => navigate(`/app/playlists/${pl.id}/edit`)}
                    >
                      ✏️ Editar
                    </button>

                    <button
                      className="playlist-card__menu-item delete"
                      onClick={() => openDeleteModal(pl.id)}
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Delete confirmation modal */}
        <Modal
          isOpen={deleteTarget !== null}
          onClose={() => setDeleteTarget(null)}
          title="Eliminar playlist"
        >
          <p>¿Seguro que quieres eliminar esta playlist?</p>
          <div className="modal-buttons">
            <button
              className="modal-btn cancel"
              onClick={() => setDeleteTarget(null)}
            >
              Cancelar
            </button>

            <button className="modal-btn delete" onClick={deletePlaylist}>
              Borrar
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default MyPlaylists;
