import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PlaylistLists.css";
import { getPublicPlaylists } from "../../../../services/beats-interaction/playlistService";
import ErrorModal from "../../../../components/ui/ErrorModal";

const PAGE_SIZE = 12;

const PublicPlaylists = () => {
  const navigate = useNavigate();

  const [playlists, setPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchPublicPlaylists = async () => {
      setIsLoading(true);

      try {
        const response = await getPublicPlaylists({
          page,
          limit: PAGE_SIZE,
        });

        const {
          playlists = [],
          totalPages: backendTotalPages = 1,
        } = response.data || {};

        setPlaylists(playlists);
        setTotalPages(backendTotalPages);
      } catch (error) {
        console.error("Error loading public playlists:", error);
        setErrorMessage("No se pudieron cargar las playlists públicas");
        setErrorModalOpen(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublicPlaylists();
  }, [page]);

  const handleOpenPlaylist = (id) => {
    navigate(`/app/playlists/${id}`);
  };

  return (
    <div className="playlist-list">
      <div className="playlist-list__container">
        <h1 className="playlist-list__title">Playlists Públicas</h1>
        <p className="playlist-list__subtitle">
          Explora playlists creadas por otros usuarios.
        </p>

        {isLoading ? (
          <p className="loading-text">Cargando playlists...</p>
        ) : playlists.length === 0 ? (
          <p className="playlist-list__empty">
            No hay playlists públicas disponibles
          </p>
        ) : (
          <>
            <div className="playlist-grid">
              {playlists.map((pl) => (
                <div
                  key={pl._id}
                  className="playlist-card"
                  onClick={() => handleOpenPlaylist(pl._id)}
                >
                  <h2 className="playlist-card__name">{pl.name}</h2>
                  <p className="playlist-card__description">
                    {pl.description || "Sin descripción"}
                  </p>

                  <div className="playlist-card__meta">
                    <span className="playlist-badge public">🌍 Pública</span>

                    {pl.collaborators?.length > 0 && (
                      <span className="playlist-badge collaborators">
                        👥 {pl.collaborators.length}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="pagination">
              <button
                className="pagination-btn"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Anterior
              </button>

              <span className="pagination-info">
                Página {page} de {totalPages}
              </span>

              <button
                className="pagination-btn"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Siguiente →
              </button>
            </div>
          </>
        )}
      </div>
      <ErrorModal
        isOpen={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        message={errorMessage}
      />
    </div>
  );
};

export default PublicPlaylists;
