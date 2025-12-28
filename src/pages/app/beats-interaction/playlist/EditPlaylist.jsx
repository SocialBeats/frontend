import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../../../components/ui/Button";
import {
  getPlaylistById,
  updatePlaylist,
} from "../../../../services/beats-interaction/playlistService";
import { searchProfiles } from "../../../../services/profileService";
import "./CreatePlaylist.css";

const EditPlaylist = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [playlistName, setPlaylistName] = useState("");
  const [playlistDescription, setPlaylistDescription] = useState("");
  const [playlistCollaborators, setPlaylistCollaborators] = useState([]);
  const [playlistIsPublic, setPlaylistIsPublic] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [foundUsers, setFoundUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

useEffect(() => {
  const fetchPlaylist = async () => {
    try {
      const response = await getPlaylistById(id);
      const playlist = response.data;

      setPlaylistName(playlist.name || "");
      setPlaylistDescription(playlist.description || "");
      setPlaylistIsPublic(playlist.isPublic || false);


      if (playlist.collaboratorsData?.length > 0) {
        const normalized = playlist.collaboratorsData.map(user => ({
          userId: user.userId,
          username: user.username,
        }));

        setPlaylistCollaborators(normalized);
      } else if (playlist.collaborators?.length > 0) {

        const { profiles = [] } = await searchProfiles({
          ids: playlist.collaborators,
        });

        const normalized = profiles.map(user => ({
          userId: user.userId,
          username: user.username,
        }));

        setPlaylistCollaborators(normalized);
      } else {
        setPlaylistCollaborators([]);
      }
    } catch (error) {
      console.error(error);
      alert("No se pudo cargar la playlist");
      navigate("/app/playlists/me");
    } finally {
      setIsLoading(false);
    }
  };

  fetchPlaylist();
}, [id, navigate]);


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
      alert("El nombre no puede estar vacío");
      return;
    }

    if (!playlistIsPublic && playlistCollaborators.length > 0) {
      alert("No puedes añadir colaboradores a una playlist privada");
      return;
    }

    if (playlistCollaborators.length > 30) {
      alert("Máximo 30 colaboradores");
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        name: playlistName.trim(),
        description: playlistDescription.trim(),
        isPublic: playlistIsPublic,
        collaborators: playlistIsPublic
          ? playlistCollaborators.map(user => user.userId)
          : [],
      };

      await updatePlaylist(id, payload);

      navigate(`/app/playlists/${id}`);
    } catch (error) {
      console.error("Error al actualizar playlist:", error);
      alert(
        error?.response?.data?.message ||
          "Error al actualizar la playlist"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/app/playlists/${id}`);
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
              disabled={isSaving}
            />
          </div>

          {/* Colaboradores */}
          <div className="create-playlist__form-group">
            <label className="create-playlist__label">Colaboradores</label>

            {/* Chips */}
            <div className="selected-collaborators">
              {playlistCollaborators.map(user => (
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
              disabled={!playlistIsPublic || isSaving}
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
                  foundUsers.map(user => (
                    <div
                      key={user.userId}
                      className="collaborator-dropdown__item"
                      onClick={() => {
                        toggleCollaborator(user);
                        setSearchQuery("");
                        setFoundUsers([]);
                      }}
                    >
                      {user.username}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Visibilidad */}
          <div className="create-playlist__form-group switch-row">
            <label className="create-playlist__label">
              Playlist Pública
            </label>
            <label className="switch">
              <input
                type="checkbox"
                checked={playlistIsPublic}
                onChange={() => {
                  setPlaylistIsPublic(prev => !prev);
                  setPlaylistCollaborators([]);
                  setSearchQuery("");
                  setFoundUsers([]);
                }}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="create-playlist__actions">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={!playlistName.trim() || isSaving}
            >
              {isSaving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditPlaylist;
