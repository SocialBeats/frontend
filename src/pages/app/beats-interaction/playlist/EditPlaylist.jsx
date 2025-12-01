import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../../../components/ui/Button';
import './CreatePlaylist.css';

const mockUsers = [
  { id: 1, name: "Ana García" },
  { id: 2, name: "Luis Martínez" },
  { id: 3, name: "Sara López" },
  { id: 4, name: "Carlos Ruiz" },
  { id: 5, name: "Julia Méndez" },
];

const mockPlaylists = [
  {
    id: 42,
    name: "Mis Temazos",
    description: "Playlist con mis canciones favoritas 🎶",
    collaborators: [1, 4],
    isPublic: true,
  },
];

const EditPlaylist = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);

  const [playlistName, setPlaylistName] = useState("");
  const [playlistDescription, setPlaylistDescription] = useState("");
  const [playlistCollaborators, setPlaylistCollaborators] = useState([]);
  const [playlistIsPublic, setPlaylistIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = mockUsers.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !playlistCollaborators.includes(u.id)
  );

  const toggleCollaborator = (userId) => {
    setPlaylistCollaborators(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  useEffect(() => {
    const playlist = mockPlaylists.find(p => p.id === Number(id));

    if (!playlist) {
      alert("La playlist no existe");
      navigate("/app/playlists");
      return;
    }

    setPlaylistName(playlist.name);
    setPlaylistDescription(playlist.description);
    setPlaylistCollaborators(playlist.collaborators);
    setPlaylistIsPublic(playlist.isPublic);

    setIsLoading(false);
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!playlistName.trim()) {
      alert("El nombre no puede estar vacío");
      return;
    }

    setIsSaving(true);

    try {
      const updatedPlaylist = {
        id: Number(id),
        name: playlistName,
        description: playlistDescription,
        collaborators: playlistCollaborators,
        isPublic: playlistIsPublic,
        updatedAt: new Date().toISOString(),
      };

      console.log("Playlist actualizada:", updatedPlaylist);

      // navigate(`/app/playlists/${id}`);

    } catch (error) {
      console.error("Error al actualizar playlist:", error);
      alert("Error al actualizar la playlist");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // navigate("/app/playlists");
  };

  if (isLoading) {
    return <p className="loading-text">Cargando playlist...</p>;
  }

  return (
    <div className="create-playlist">
      <div className="create-playlist__container">
        
        <div className="create-playlist__header">
          <h1 className="create-playlist__title">Editar Playlist</h1>
          <p className="create-playlist__subtitle">
            Modifica la información y guarda los cambios.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="playlist__form">

          {/* Nombre */}
          <div className="create-playlist__form-group">
            <label className="create-playlist__label">Nombre *</label>
            <input
              type="text"
              className="create-playlist__input"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              placeholder="Ej: Favoritas de 2024"
              disabled={isSaving}
            />
          </div>

          {/* Descripción */}
          <div className="create-playlist__form-group">
            <label className="create-playlist__label">Descripción</label>
            <textarea
              className="create-playlist__textarea"
              value={playlistDescription}
              onChange={(e) => setPlaylistDescription(e.target.value)}
              placeholder="Ej: Canciones más escuchadas del año"
              disabled={isSaving}
            ></textarea>
          </div>

          {/* Collaborators */}
          <div className="create-playlist__form-group">
            <label className="create-playlist__label">Colaboradores</label>

            {/* Chips */}
            <div className="selected-collaborators">
              {playlistCollaborators.map(id => {
                const user = mockUsers.find(u => u.id === id);
                if (!user) return null;
                return (
                  <div key={id} className="collab-chip">
                    {user.name}
                    <span className="remove-chip" onClick={() => toggleCollaborator(id)}>
                      ✕
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Search box */}
            <input
              type="text"
              className="create-playlist__input collaborator-search"
              placeholder="Buscar colaboradores..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isSaving}
            />

            {searchQuery.trim() && (
              <div className="collaborator-dropdown">
                {filteredUsers.length === 0 ? (
                  <div className="collaborator-dropdown__empty">
                    No se encontraron usuarios
                  </div>
                ) : (
                  filteredUsers.map(user => (
                    <div
                      key={user.id}
                      className="collaborator-dropdown__item"
                      onClick={() => {
                        toggleCollaborator(user.id);
                        setSearchQuery("");
                      }}
                    >
                      {user.name}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Public switch */}
          <div className="create-playlist__form-group switch-row">
            <label className="create-playlist__label">Playlist Pública</label>

            <label className="switch">
              <input
                type="checkbox"
                checked={playlistIsPublic}
                onChange={() => setPlaylistIsPublic(prev => !prev)}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="create-playlist__actions">
            <Button type="button" variant="secondary" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!playlistName.trim() || isSaving}>
              {isSaving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPlaylist;
