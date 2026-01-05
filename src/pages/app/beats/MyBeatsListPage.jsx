import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Play } from "lucide-react";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import logo from "../../../assets/logo-dark-no-fondo.png";
// import { mockedBeats } from "./mockBeats";
import { getMyBeats } from "../../../services/beatsService";
import "./MyBeatsListPage.css";
import { useParams, useNavigate } from "react-router-dom";
import { Feature, On, Default, Loading, ErrorFallback } from 'space-react-client';

const MyBeatsListPage = () => {
  const [beats, setBeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBeats = async () => {
      try {
        const data = await getMyBeats();
        setBeats(data);
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Error al cargar los beats. Por favor, inténtalo más tarde.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchBeats();
  }, []);

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: "50vh" }}>
        <div className="text-xl text-muted">Cargando beats...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-center" style={{ minHeight: "50vh" }}>
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="my-beats-page">
      <div className="my-beats-header">
        <div className="header-content">
          <div className="header-text">
            <h1 className="text-3xl font-bold">Mis Beats</h1>
            <p className="text-muted">Explora y gestiona tu colección de beats</p>
          </div>
          <Feature id="socialbeats-beats">
            <On>
              <Link to="/app/beats/new" className="create-beat-link">
                <Button variant="primary" size="large" className="create-beat-btn gap-2">
                  <Plus size={20} /> Crear Beat
                </Button>
              </Link>
            </On>
            <Default>
              <Link to="/app/pricing" className="create-beat-link">
                <Button variant="primary" size="large" className="create-beat-btn gap-2">
                  Mejorar plan para crear más Beats
                </Button>
              </Link>
            </Default>
            <Loading>
              <span>Comprobando tu plan...</span>
            </Loading>
            <ErrorFallback>
              <span>Error al verificar tu plan</span>
            </ErrorFallback>
          </Feature>
        </div>
      </div>

      <div className="beats-grid">
        {beats.map((beat) => (
          <Link
            to={`/app/beats/${beat._id}`}
            key={beat._id}
            className="beat-card-link"
          >
            <Card className="beat-card" hover={true}>
              <div className="beat-cover-container">
                <img
                  src={(() => {
                    if (beat.audio?.coverUrl) return beat.audio.coverUrl;
                    if (beat.audio?.s3CoverKey) {
                      const domain = window.RUNTIME_CONFIG?.VITE_CDN_DOMAIN || import.meta.env.VITE_CDN_DOMAIN || '';
                      const key = beat.audio.s3CoverKey.startsWith('/')
                        ? beat.audio.s3CoverKey.slice(1)
                        : beat.audio.s3CoverKey;
                      return `${domain}/${key}`;
                    }
                    return logo;
                  })()}
                  alt={beat.title}
                  className="beat-cover"
                  onError={(e) => { e.target.src = logo; }}
                />
                <div className="beat-overlay">
                  <div className="play-button">
                    <span className="play-icon"><Play size={24} fill="currentColor" className="ml-1" /></span>
                  </div>
                </div>
              </div>
              <div className="beat-card-info">
                <h3 className="beat-card-title">{beat.title}</h3>
                <div className="beat-card-metadata">
                  <span className="beat-card-genre">{beat.genre}</span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MyBeatsListPage;
