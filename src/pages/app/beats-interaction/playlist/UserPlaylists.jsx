import { useNavigate } from 'react-router-dom';
import './PlaylistLists.css';

// Mock playlists for now
const mockPlaylists = [
  {
    id: 1,
    name: 'Favoritas 2024',
    description: 'Mis canciones más escuchadas del año.'
  },
  {
    id: 2,
    name: 'Beats para trabajar',
    description: 'Playlist perfecta para concentrarse.'
  },
  {
    id: 3,
    name: 'Reggaeton Old School',
    description: 'Clásicos de reggaeton del 2000 al 2010.'
  }
];

const UserPlaylists = () => {
  const navigate = useNavigate();

  const handleOpenPlaylist = (id) => {
    navigate(`/app/playlists/${id}`);
  };

  return (
    <div className="playlist-list">
      <div className="playlist-list__container">
        <h1 className="playlist-list__title">Tus Playlists</h1>
        <p className="playlist-list__subtitle">Lista de playlists creadas o compartidas contigo.</p>

        <div className="playlist-grid">
          {mockPlaylists.map((pl) => (
            <div
              key={pl.id}
              className="playlist-card"
              onClick={() => handleOpenPlaylist(pl.id)}
            >
              <h2 className="playlist-card__name">{pl.name}</h2>
              <p className="playlist-card__description">{pl.description || 'Sin descripción'}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserPlaylists;
