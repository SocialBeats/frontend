import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Settings, Play } from "lucide-react";
import Button from "../../../components/ui/Button";
import IconButton from "../../../components/ui/IconButton";
import Card from "../../../components/ui/Card";
import logo from "../../../assets/logo-dark-no-fondo.png";
import ColumnSelector from "./ColumnSelector";
import { getBeats } from "../../../services/beatsService";
import "./BeatsTable.css";

const allColumns = [
  { key: "artist", label: "Artist" },
  { key: "genre", label: "Genre" },
  { key: "bpm", label: "BPM" },
  { key: "key", label: "Key" },
  { key: "duration", label: "Duration" },
  { key: "price", label: "Price" },
  { key: "plays", label: "Plays" },
  { key: "downloads", label: "Downloads" },
  { key: "likes", label: "Likes" },
  { key: "comments", label: "Comments" },
  { key: "mood", label: "Mood" },
  { key: "license", label: "License" },
  { key: "createdAt", label: "Upload Date" },
];

const BeatsListPage = () => {
  const [beats, setBeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    artist: true,
    genre: true,
    bpm: false,
    key: false,
    duration: true,
    price: false,
    plays: false,
    downloads: false,
    likes: false,
    comments: false,
    mood: false,
    license: false,
    createdAt: false,
  });

  const containerRef = useRef(null);
  const [fixedWidth, setFixedWidth] = useState(null);

  const handleColumnChange = (columnKey) => {
    setVisibleColumns((prev) => ({ ...prev, [columnKey]: !prev[columnKey] }));
  };

  // Capture initial width on mount and window resize
  useEffect(() => {
    const captureWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.getBoundingClientRect().width;
        setFixedWidth(width);
      }
    };

    // Capture on mount (with a small delay to ensure layout is stable)
    const timer = setTimeout(captureWidth, 100);

    // Recapture on window resize
    window.addEventListener('resize', captureWidth);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', captureWidth);
    };
  }, []);

  useEffect(() => {
    const fetchBeats = async () => {
      try {
        const data = await getBeats();

        // Format data for display
        const formattedBeats = data.map((beat) => ({
          ...beat,
          formattedDuration: formatDuration(beat.duration || 0),
          formattedPrice: beat.pricing?.isFree
            ? "Free"
            : `$${beat.pricing?.price || 0}`,
          formattedPlays: (beat.stats?.plays || 0).toLocaleString(),
          formattedDownloads: (beat.stats?.downloads || 0).toLocaleString(),
          formattedLikes: (beat.stats?.likes || 0).toLocaleString(),
          formattedComments: (beat.stats?.comments || 0).toLocaleString(),
          formattedDate: beat.createdAt ? new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }).format(new Date(beat.createdAt)) : "N/A",
        }));
        setBeats(formattedBeats);
      } catch (err) {
        setError("Error fetching beats. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBeats();
  }, []);

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

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

  // Dynamic grid template with fixed widths for proper scroll behavior
  const getGridTemplate = () => {
    const activeCols = allColumns.filter((col) => visibleColumns[col.key]);

    // Define fixed widths for each column type
    const colWidths = activeCols
      .map((col) => {
        switch (col.key) {
          case 'artist':
            return '180px';
          case 'genre':
            return '130px';
          case 'bpm':
            return '90px';
          case 'key':
            return '80px';
          case 'duration':
            return '100px';
          case 'price':
            return '120px';
          case 'plays':
          case 'downloads':
          case 'likes':
          case 'comments':
            return '110px';
          case 'mood':
            return '120px';
          case 'license':
            return '110px';
          case 'createdAt':
            return '140px';
          default:
            return '120px';
        }
      })
      .join(" ");

    // Fixed: index (50px), title (250px), [dynamic], cover (60px)
    return `50px 250px ${colWidths} 60px`;
  };

  const gridStyle = { gridTemplateColumns: getGridTemplate() };

  return (
    <div
      ref={containerRef}
      className="beats-page-container"
      style={fixedWidth ? { width: `${fixedWidth}px`, maxWidth: `${fixedWidth}px` } : {}}
    >
      <div className="beats-page-header">
        <h1 className="text-3xl font-bold">Beats</h1>
      </div>

      <div className="beats-page-layout">
        <div className="beats-table-container-wrapper">
          <div className="beats-table-content">
            {/* Table Header */}
            <div className="beats-table-header-wrapper">
              <div className="beats-table-header" style={gridStyle}>
                <div className="col-index">#</div>
                <div className="col-title">Title</div>
                {visibleColumns.artist && (
                  <div className="col-artist">Artist</div>
                )}
                {visibleColumns.genre && <div className="col-genre">Genre</div>}
                {visibleColumns.bpm && <div className="col-bpm">BPM</div>}
                {visibleColumns.key && <div className="col-key">Key</div>}
                {visibleColumns.duration && (
                  <div className="col-duration">Duration</div>
                )}
                {visibleColumns.price && <div className="col-price">Price</div>}
                {visibleColumns.plays && <div className="col-plays">Plays</div>}
                {visibleColumns.downloads && (
                  <div className="col-downloads">Downloads</div>
                )}
                {visibleColumns.likes && <div className="col-likes">Likes</div>}
                {visibleColumns.comments && (
                  <div className="col-comments">Comments</div>
                )}
                {visibleColumns.mood && <div className="col-mood">Mood</div>}
                {visibleColumns.license && (
                  <div className="col-license">License</div>
                )}
                {visibleColumns.createdAt && (
                  <div className="col-created">Upload Date</div>
                )}
                {/* <div className="col-cover">Cover</div> */}
                <div className="beats-table-settings">
                  <IconButton
                    variant="ghost"
                    size="small"
                    onClick={() => setShowColumnSelector(!showColumnSelector)}
                    className="settings-icon-btn"
                  >
                    <Settings size={16} />
                  </IconButton>
                </div>
              </div>
            </div>

            {/* Table Body */}
            <div className="beats-table-body">
              {beats.map((beat, index) => (
                <Link
                  to={`/app/beats/${beat._id}`}
                  key={beat._id}
                  className="beat-row-link"
                >
                  <Card
                    className="beats-table-row"
                    padding="none"
                    hover={false}
                    style={gridStyle}
                  >
                    <div className="col-index">
                      <span className="beat-index">{index + 1}</span>
                      <span className="beat-play-icon"><Play size={12} fill="currentColor" /></span>
                    </div>
                    <div className="col-title">
                      <div className="beat-info">
                        <span className="beat-title-text">{beat.title}</span>
                        <span className="beat-artist-mobile">
                          {beat.artist}
                        </span>
                      </div>
                    </div>
                    {visibleColumns.artist && (
                      <div className="col-artist">{beat.artist}</div>
                    )}
                    {visibleColumns.genre && (
                      <div className="col-genre">{beat.genre}</div>
                    )}
                    {visibleColumns.bpm && (
                      <div className="col-bpm">{beat.bpm}</div>
                    )}
                    {visibleColumns.key && (
                      <div className="col-key">{beat.key}</div>
                    )}
                    {visibleColumns.duration && (
                      <div className="col-duration">
                        {beat.formattedDuration}
                      </div>
                    )}
                    {visibleColumns.price && (
                      <div className="col-price">
                        <span className="beat-price-tag">
                          {beat.formattedPrice}
                        </span>
                      </div>
                    )}
                    {visibleColumns.plays && (
                      <div className="col-plays">{beat.formattedPlays}</div>
                    )}
                    {visibleColumns.downloads && (
                      <div className="col-downloads">
                        {beat.formattedDownloads}
                      </div>
                    )}
                    {visibleColumns.likes && (
                      <div className="col-likes">{beat.formattedLikes}</div>
                    )}
                    {visibleColumns.comments && (
                      <div className="col-comments">
                        {beat.formattedComments}
                      </div>
                    )}
                    {visibleColumns.mood && (
                      <div className="col-mood">{beat.mood}</div>
                    )}
                    {visibleColumns.license && (
                      <div className="col-license">{beat.license}</div>
                    )}
                    {visibleColumns.createdAt && (
                      <div className="col-created">{beat.formattedDate}</div>
                    )}
                    <div className="col-cover">
                      <img
                        src={logo}
                        alt="Cover"
                        className="beat-cover-small"
                      />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Column Selector - Side panel */}
        {showColumnSelector && (
          <div className="column-selector-sidebar">
            <ColumnSelector
              columns={allColumns}
              visibleColumns={visibleColumns}
              onColumnChange={handleColumnChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default BeatsListPage;
