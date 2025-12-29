import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Play } from "lucide-react";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import logo from "../../../assets/logo-dark-no-fondo.png";
// import { mockedBeats } from "./mockBeats";
import { getMyBeats } from "../../../services/beatsService";
import "./MyBeatsListPage.css";

const MyBeatsListPage = () => {
  const [beats, setBeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBeats = async () => {
      try {
        console.log('🔍 Fetching beats from API...');
        const data = await getMyBeats();
        console.log('✅ Beats fetched successfully:', data);
        setBeats(data);
      } catch (err) {
        console.error('❌ Error fetching beats:', err);
        console.error('Error details:', {
          message: err.message,
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          config: err.config
        });
        setError("Error fetching beats. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBeats();
  }, []);

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: "50vh" }}>
        <div className="text-xl text-muted">Loading beats...</div>
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
            <h1 className="text-3xl font-bold">My Beats</h1>
            <p className="text-muted">Browse and manage your beat collection</p>
          </div>
          <Link to="/app/beats/new" className="create-beat-link">
            <Button variant="primary" size="large" className="create-beat-btn gap-2">
              <Plus size={20} /> Create Beat
            </Button>
          </Link>
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
