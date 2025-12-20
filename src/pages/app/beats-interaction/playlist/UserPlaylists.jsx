import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./PlaylistLists.css";
import { getUserPlaylists } from "../../../../services/beats-interaction/playlistService";

const UserPlaylists = () => {
  const navigate = useNavigate();
  const { id: userId } = useParams();

  const [playlists, setPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const response = await getUserPlaylists(userId);
        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.playlists || [];
        setPlaylists(data);
      } catch (error) {
        console.error("Error loading user playlists:", error);
        alert("No se pudieron cargar las playlists del usuario");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylists();
  }, [userId]);

  const handleOpenPlaylist = (id) => {
    navigate(`/app/playlists/${id}`);
  };

  if (isLoading) {
    return <p className="loading-text">Cargando playlists...</p>;
  }

  return (
    <div className="playlist-list">
      <div className="playlist-list__container">
        <h1 className="playlist-list__title">Playlists del usuario</h1>
        <p className="playlist-list__subtitle">
          Lista de playlists creadas o compartidas por este usuario.
        </p>

        {playlists.length === 0 ? (
          <p className="playlist-list__empty">Este usuario aún no tiene playlists</p>
        ) : (
          <div className="playlist-grid">
            {playlists.map((pl) => (
              <div
                key={pl._id || pl.id}
                className="playlist-card"
                onClick={() => handleOpenPlaylist(pl._id || pl.id)}
              >
                <h2 className="playlist-card__name">{pl.name}</h2>
                <p className="playlist-card__description">
                  {pl.description || "Sin descripción"}
                </p>
                <div className="playlist-card__meta">
                  <span className={`playlist-badge ${pl.isPublic ? "public" : "private"}`}>
                    {pl.isPublic ? "🌍 Pública" : "🔒 Privada"}
                  </span>
                  {pl.collaborators?.length > 0 && (
                    <span className="playlist-badge collaborators">👥 {pl.collaborators.length}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPlaylists;
