import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import Button from "../../../components/ui/Button";
import IconButton from "../../../components/ui/IconButton";
import Card from "../../../components/ui/Card";
import logo from "../../../assets/logo-dark-no-fondo.png";
import ColumnSelector from "./ColumnSelector";
import "./BeatsTable.css";

const mockedBeats = [
  {
    _id: "1",
    title: "Summer Vibes",
    artist: "DJ Producer",
    genre: "Hip Hop",
    bpm: 120,
    key: "C#",
    duration: 180,
    tags: ["chill", "summer", "trap"],
    pricing: { isFree: false, price: 29.99, currency: "USD" },
    stats: { plays: 1500, downloads: 200, likes: 350, comments: 45 },
    createdAt: new Date("2023-05-15T10:00:00Z"),
    mood: "Happy",
    license: "Exclusive",
  },
  {
    _id: "2",
    title: "Chill Lo-Fi",
    artist: "BeatMaker",
    genre: "Lo-Fi",
    bpm: 90,
    key: "A#",
    duration: 150,
    tags: ["lofi", "chill", "relax"],
    pricing: { isFree: true, price: 0, currency: "USD" },
    stats: { plays: 8000, downloads: 1200, likes: 2100, comments: 180 },
    createdAt: new Date("2023-04-20T15:30:00Z"),
    mood: "Relaxed",
    license: "Free",
  },
  {
    _id: "3",
    title: "Trap Banger",
    artist: "TrapGod",
    genre: "Trap",
    bpm: 150,
    key: "G",
    duration: 165,
    tags: ["trap", "banger", "hard"],
    pricing: { isFree: false, price: 19.99, currency: "USD" },
    stats: { plays: 12000, downloads: 800, likes: 1800, comments: 120 },
    createdAt: new Date("2023-03-10T18:45:00Z"),
    mood: "Energetic",
    license: "Lease",
  },
  {
    _id: "4",
    title: "Dark Phonk",
    artist: "PhonkMaster",
    genre: "Phonk",
    bpm: 140,
    key: "F#",
    duration: 195,
    tags: ["phonk", "dark", "memphis"],
    pricing: { isFree: false, price: 34.99, currency: "USD" },
    stats: { plays: 5600, downloads: 420, likes: 890, comments: 67 },
    createdAt: new Date("2023-06-22T14:20:00Z"),
    mood: "Dark",
    license: "Exclusive",
  },
  {
    _id: "5",
    title: "Reggaeton Heat",
    artist: "Latino Beats",
    genre: "Reggaeton",
    bpm: 95,
    key: "Dm",
    duration: 210,
    tags: ["reggaeton", "latin", "party"],
    pricing: { isFree: false, price: 24.99, currency: "USD" },
    stats: { plays: 15000, downloads: 950, likes: 3200, comments: 210 },
    createdAt: new Date("2023-07-01T09:15:00Z"),
    mood: "Party",
    license: "Lease",
  },
  {
    _id: "6",
    title: "Jazz Fusion",
    artist: "Smooth Operator",
    genre: "Jazz",
    bpm: 110,
    key: "Eb",
    duration: 240,
    tags: ["jazz", "fusion", "smooth"],
    pricing: { isFree: false, price: 39.99, currency: "USD" },
    stats: { plays: 3200, downloads: 180, likes: 520, comments: 34 },
    createdAt: new Date("2023-05-30T16:45:00Z"),
    mood: "Sophisticated",
    license: "Exclusive",
  },
  {
    _id: "7",
    title: "Drill Type Beat",
    artist: "UK Producer",
    genre: "Drill",
    bpm: 145,
    key: "Bm",
    duration: 175,
    tags: ["drill", "uk", "aggressive"],
    pricing: { isFree: false, price: 49.99, currency: "USD" },
    stats: { plays: 9500, downloads: 650, likes: 1650, comments: 95 },
    createdAt: new Date("2023-08-12T11:30:00Z"),
    mood: "Aggressive",
    license: "Exclusive",
  },
  {
    _id: "8",
    title: "Ambient Dreams",
    artist: "Ethereal Sounds",
    genre: "Ambient",
    bpm: 75,
    key: "Am",
    duration: 300,
    tags: ["ambient", "atmospheric", "meditation"],
    pricing: { isFree: true, price: 0, currency: "USD" },
    stats: { plays: 6700, downloads: 890, likes: 1450, comments: 78 },
    createdAt: new Date("2023-09-05T20:00:00Z"),
    mood: "Calm",
    license: "Free",
  },
  {
    _id: "9",
    title: "Boom Bap Classic",
    artist: "Old School",
    genre: "Boom Bap",
    bpm: 88,
    key: "E",
    duration: 190,
    tags: ["boombap", "classic", "90s"],
    pricing: { isFree: false, price: 27.99, currency: "USD" },
    stats: { plays: 7800, downloads: 580, likes: 1320, comments: 102 },
    createdAt: new Date("2023-10-18T13:25:00Z"),
    mood: "Nostalgic",
    license: "Lease",
  },
  {
    _id: "10",
    title: "EDM Anthem",
    artist: "Festival Vibes",
    genre: "EDM",
    bpm: 128,
    key: "C",
    duration: 220,
    tags: ["edm", "festival", "uplifting"],
    pricing: { isFree: false, price: 44.99, currency: "USD" },
    stats: { plays: 18000, downloads: 1100, likes: 4200, comments: 265 },
    createdAt: new Date("2023-11-02T17:50:00Z"),
    mood: "Uplifting",
    license: "Exclusive",
  },
  {
    _id: "11",
    title: "Afrobeat Groove",
    artist: "Afro Producer",
    genre: "Afrobeat",
    bpm: 105,
    key: "Gm",
    duration: 205,
    tags: ["afrobeat", "groove", "rhythmic"],
    pricing: { isFree: false, price: 32.99, currency: "USD" },
    stats: { plays: 11200, downloads: 720, likes: 2400, comments: 156 },
    createdAt: new Date("2023-09-28T08:40:00Z"),
    mood: "Groovy",
    license: "Lease",
  },
  {
    _id: "12",
    title: "Synthwave Nights",
    artist: "Retro Wave",
    genre: "Synthwave",
    bpm: 115,
    key: "D",
    duration: 195,
    tags: ["synthwave", "retro", "80s"],
    pricing: { isFree: false, price: 36.99, currency: "USD" },
    stats: { plays: 8900, downloads: 510, likes: 1780, comments: 88 },
    createdAt: new Date("2023-10-05T19:15:00Z"),
    mood: "Nostalgic",
    license: "Exclusive",
  },
  {
    _id: "13",
    title: "Melodic Techno",
    artist: "Deep Tech",
    genre: "Techno",
    bpm: 124,
    key: "Am",
    duration: 360,
    tags: ["techno", "melodic", "progressive"],
    pricing: { isFree: false, price: 41.99, currency: "USD" },
    stats: { plays: 5400, downloads: 340, likes: 920, comments: 54 },
    createdAt: new Date("2023-11-15T22:30:00Z"),
    mood: "Hypnotic",
    license: "Lease",
  },
];

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
    const fetchBeats = () => {
      try {
        // Simulate API call with mocks
        const data = mockedBeats;

        // Format data for display
        const formattedBeats = data.map((beat) => ({
          ...beat,
          formattedDuration: formatDuration(beat.duration),
          formattedPrice: beat.pricing.isFree
            ? "Free"
            : `$${beat.pricing.price}`,
          formattedPlays: beat.stats.plays.toLocaleString(),
          formattedDownloads: beat.stats.downloads.toLocaleString(),
          formattedLikes: beat.stats.likes.toLocaleString(),
          formattedComments: beat.stats.comments.toLocaleString(),
          formattedDate: new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }).format(beat.createdAt),
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
        <h1 className="text-3xl font-bold">Mis Beats</h1>
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
                    ⚙️
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
                      <span className="beat-play-icon">▶</span>
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
