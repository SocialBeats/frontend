import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../../components/ui/Button';
import './CreatePlaylist.css';

const mockUsers = [
  { id: 1, name: "Ana García" },
  { id: 2, name: "Luis Martínez" },
  { id: 3, name: "Sara López" },
  { id: 4, name: "Carlos Ruiz" },
  { id: 5, name: "Julia Méndez" },
];

const CreatePlaylist = () => {
  const navigate = useNavigate();

  const [playlistName, setPlaylistName] = useState('');
  const [playlistDescription, setPlaylistDescription] = useState('');
  const [playlistCollaborators, setPlaylistCollaborators] = useState([]);
  const [playlistIsPublic, setPlaylistIsPublic] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!playlistName.trim()) {
      alert('Por favor ingresa un nombre para la playlist');
      return;
    }

    setIsCreating(true);

    try {
      const mockPlaylist = {
        id: Date.now(),
        name: playlistName,
        description: playlistDescription,
        collaborators: playlistCollaborators,
        isPublic: playlistIsPublic,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log("Playlist creada:", mockPlaylist);

      // navigate(`/app/playlists/${mockPlaylist.id}`);

    } catch (error) {
      console.error("Error al crear playlist:", error);
      alert("Error al crear la playlist");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    navigate('/app/playlists');
  };

  return (
    <div className="create-playlist">
      <div className="create-playlist__container">

        <div className="create-playlist__header">
          <h1 className="create-playlist__title">Crear Nueva Playlist</h1>
          <p className="create-playlist__subtitle">
            Crea una playlist y luego podrás agregar canciones.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="playlist__form">

          {/* Nombre */}
          <div className="create-playlist__form-group">
            <label className="create-playlist__label">Nombre de la Playlist *</label>
            <input
              type="text"
              className="create-playlist__input"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              placeholder="Ej: Favoritas de 2024"
              disabled={isCreating}
              autoFocus
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
              disabled={isCreating}
            ></textarea>
          </div>

          {/* Collaborators - estilo GitHub */}
          <div className="create-playlist__form-group">
            <label className="create-playlist__label">Colaboradores</label>

            {/* Chips seleccionados */}
            <div className="selected-collaborators">
              {playlistCollaborators.map(id => {
                const user = mockUsers.find(u => u.id === id);
                if (!user) return null;
                return (
                  <div
                    key={id}
                    className="collab-chip"
                  >
                    {user.name}
                    <span
                      className="remove-chip"
                      onClick={() => toggleCollaborator(id)}
                    >
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
              disabled={isCreating}
            />

            {/* Resultado búsqueda */}
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

          {/* Switch de visibilidad */}
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
            <Button type="submit" disabled={!playlistName.trim() || isCreating}>
              {isCreating ? "Creando..." : "Crear Playlist"}
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default CreatePlaylist;
