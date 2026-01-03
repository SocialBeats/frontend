import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../../components/ui/Button";
import "./CreatePlaylist.css";
import { createPlaylist } from "../../../../services/beats-interaction/playlistService";
import { searchProfiles } from "../../../../services/profileService";
import { Default, Feature, On } from "space-react-client";
import ErrorModal from "../../../../components/ui/ErrorModal";

const CreatePlaylist = () => {
  const navigate = useNavigate();

  const [playlistName, setPlaylistName] = useState("");
  const [playlistDescription, setPlaylistDescription] = useState("");
  const [playlistCollaborators, setPlaylistCollaborators] = useState([]);
  const [playlistIsPublic, setPlaylistIsPublic] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [foundUsers, setFoundUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!playlistIsPublic || searchQuery.trim().length < 2) {
      setFoundUsers([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setIsSearching(true);

      try {
        const { profiles = [] } = await searchProfiles(searchQuery.trim());

        const filtered = profiles.filter(
          user =>
            !playlistCollaborators.some(
              collaborator => collaborator.userId === user.userId
            )
        );

        setFoundUsers(filtered);
      } catch (error) {
        console.error("Error buscando usuarios:", error);
        setFoundUsers([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchQuery, playlistCollaborators, playlistIsPublic]);

  const toggleCollaborator = (user) => {
    setPlaylistCollaborators(prev =>
      prev.some(u => u.userId === user.userId)
        ? prev.filter(u => u.userId !== user.userId)
        : [...prev, user]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!playlistName.trim()) {
      setErrorMessage("Por favor ingresa un nombre para la playlist");
      setErrorModalOpen(true);
      return;
    }

    if (!playlistIsPublic && playlistCollaborators.length > 0) {
      setErrorMessage("No puedes añadir colaboradores a una playlist privada");
      setErrorModalOpen(true);
      return;
    }

    if (playlistCollaborators.length > 30) {
      setErrorMessage("Máximo 30 colaboradores");
      setErrorModalOpen(true);
      return;
    }

    setIsCreating(true);

    try {
      const payload = {
        name: playlistName.trim(),
        description: playlistDescription.trim(),
        isPublic: playlistIsPublic,
        collaborators: playlistIsPublic
          ? playlistCollaborators.map(user => user.userId)
          : [],
        items: [],
      };

      const response = await createPlaylist(payload);
      const createdPlaylist = response.data;

      navigate(`/app/playlists/${createdPlaylist._id}`);
    } catch (error) {
      console.error("Error al crear playlist:", error);
      setErrorMessage(error?.response?.data?.message || "Error al crear la playlist");
      setErrorModalOpen(true);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    navigate("/app/playlists/me");
  };

  return (
    <>
      <div className="create-playlist">
        <div className="create-playlist__container">
          <div className="create-playlist__header">
            <h1 className="create-playlist__title">Crear Nueva Playlist</h1>
            <p className="create-playlist__subtitle">
              Crea una playlist y luego podrás agregar canciones.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="playlist__form">
            {/* Name */}
            <div className="create-playlist__form-group">
              <label className="create-playlist__label">
                Nombre de la Playlist *
              </label>
              <input
                type="text"
                className="create-playlist__input"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
                disabled={isCreating}
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="create-playlist__form-group">
              <label className="create-playlist__label">Descripción</label>
              <textarea
                className="create-playlist__textarea"
                value={playlistDescription}
                onChange={(e) => setPlaylistDescription(e.target.value)}
                disabled={isCreating}
              />
            </div>

            {/* collaborators */}
            <div className="create-playlist__form-group">
              <label className="create-playlist__label">Colaboradores</label>

              {/* Chips */}
              <div className="selected-collaborators">
                {playlistCollaborators.map((user) => (
                  <div key={user.userId} className="collab-chip">
                    {user.username}
                    <span
                      className="remove-chip"
                      onClick={() => toggleCollaborator(user)}
                    >
                      ✕
                    </span>
                  </div>
                ))}
              </div>

              <input
                type="text"
                className="create-playlist__input collaborator-search"
                placeholder={
                  playlistIsPublic
                    ? "Buscar colaboradores..."
                    : "Haz la playlist pública para añadir colaboradores"
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={!playlistIsPublic || isCreating}
              />

              {playlistIsPublic && searchQuery.trim() && (
                <div className="collaborator-dropdown">
                  {isSearching ? (
                    <div className="collaborator-dropdown__empty">
                      Buscando...
                    </div>
                  ) : foundUsers.length === 0 ? (
                    <div className="collaborator-dropdown__empty">
                      No se encontraron usuarios
                    </div>
                  ) : (
                    foundUsers.map((user) => (
                      <div
                        key={user.userId}
                        className="collaborator-dropdown__item"
                        onClick={() => {
                          toggleCollaborator(user);
                          setSearchQuery("");
                          setFoundUsers([]);
                        }}
                      >
                        <strong>{user.username}</strong>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Visibility */}
            <div className="create-playlist__form-group switch-row">
              <label className="create-playlist__label">Playlist Pública</label>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={playlistIsPublic}
                  onChange={() => {
                    setPlaylistIsPublic((prev) => !prev);
                    setPlaylistCollaborators([]);
                    setSearchQuery("");
                    setFoundUsers([]);
                  }}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="create-playlist__actions">
              <Button type="button" variant="secondary" onClick={handleCancel}>
                Cancelar
              </Button>
              <Feature id="socialbeats-playlists">
                <On>
                  <Button
                    type="submit"
                    disabled={!playlistName.trim() || isCreating}
                  >
                    {isCreating ? "Creando..." : "Crear Playlist"}
                  </Button>
                </On>
                <Default>
                  <Button type="submit" disabled={true}>
                    {"Mejora tu plan para poder crear playlists"}
                  </Button>
                </Default>
              </Feature>
            </div>
          </form>
        </div>
      </div>
      <ErrorModal
        isOpen={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        message={errorMessage}
      />
    </>
  );
};

export default CreatePlaylist;
