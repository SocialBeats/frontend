import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import IconButton from '../../../components/ui/IconButton';
import Card from '../../../components/ui/Card';
import logo from '../../../assets/logo-dark-no-fondo.png';
import ColumnSelector from './ColumnSelector';
import './BeatsTable.css';

const mockedBeats = [
  {
    _id: '1',
    title: 'Summer Vibes',
    artist: 'DJ Producer',
    genre: 'Hip Hop',
    bpm: 120,
    key: 'C#',
    duration: 180,
    tags: ['chill', 'summer', 'trap'],
    pricing: { isFree: false, price: 29.99, currency: 'USD' },
    stats: { plays: 1500, downloads: 200 },
    createdAt: new Date('2023-05-15T10:00:00Z'),
  },
  {
    _id: '2',
    title: 'Chill Lo-Fi',
    artist: 'BeatMaker',
    genre: 'Lo-Fi',
    bpm: 90,
    key: 'A#',
    duration: 150,
    tags: ['lofi', 'chill', 'relax'],
    pricing: { isFree: true, price: 0, currency: 'USD' },
    stats: { plays: 8000, downloads: 1200 },
    createdAt: new Date('2023-04-20T15:30:00Z'),
  },
  {
    _id: '3',
    title: 'Trap Banger',
    artist: 'TrapGod',
    genre: 'Trap',
    bpm: 150,
    key: 'G',
    duration: 165,
    tags: ['trap', 'banger', 'hard'],
    pricing: { isFree: false, price: 19.99, currency: 'USD' },
    stats: { plays: 12000, downloads: 800 },
    createdAt: new Date('2023-03-10T18:45:00Z'),
  },
];

const allColumns = [
  { key: 'artist', label: 'Artist' },
  { key: 'bpm', label: 'BPM' },
  { key: 'key', label: 'Key' },
  { key: 'duration', label: 'Duration' },
  { key: 'price', label: 'Price' },
];

const BeatsListPage = () => {
  const [beats, setBeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    artist: true,
    bpm: true,
    key: true,
    duration: true,
    price: true,
  });

  const handleColumnChange = (columnKey) => {
    setVisibleColumns((prev) => ({ ...prev, [columnKey]: !prev[columnKey] }));
  };

  useEffect(() => {
    const fetchBeats = () => {
      try {
        // Simulate API call with mocks
        const data = mockedBeats;

        // Format data for display
        const formattedBeats = data.map(beat => ({
          ...beat,
          formattedDuration: formatDuration(beat.duration),
          formattedPrice: beat.pricing.isFree ? 'Free' : `${beat.pricing.price} ${beat.pricing.currency}`,
        }));
        setBeats(formattedBeats);
      } catch (err) {
        setError('Error fetching beats. Please try again later.');
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
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '50vh' }}>
        <div className="text-xl text-muted">Loading beats...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-center" style={{ minHeight: '50vh' }}>
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  // Dynamic grid template based on visible columns
  // Fixed columns: # (50px), Title (4fr), Actions (100px)
  // Dynamic columns: 1fr each or specific widths
  const getGridTemplate = () => {
    const activeCols = allColumns.filter(col => visibleColumns[col.key]);
    // Base: index title [dynamic] actions settings/logo
    // Let's assign weights: Artist (3fr), others (2fr)
    const colWidths = activeCols.map(col => {
      if (col.key === 'artist') return '3fr';
      return '2fr';
    }).join(' ');

    return `50px 4fr ${colWidths} 100px`;
  };

  const gridStyle = { gridTemplateColumns: getGridTemplate() };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Mis Beats</h1>
      </div>

      <div className="beats-page-layout">
        <div className="beats-table-container-wrapper">
          <div className="beats-table-content">
          {/* Table Header */}
          <div className="beats-table-header" style={gridStyle}>
            <div className="col-index">#</div>
            <div className="col-title">Title</div>
            {visibleColumns.artist && <div className="col-artist">Artist</div>}
            {visibleColumns.bpm && <div className="col-bpm">BPM</div>}
            {visibleColumns.key && <div className="col-key">Key</div>}
            {visibleColumns.duration && <div className="col-duration">Duration</div>}
            {visibleColumns.price && <div className="col-price">Price</div>}
            <div className="col-settings-header">
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

          {/* Table Body */}
          <div className="beats-table-body">
            {beats.map((beat, index) => (
              <Link to={`/app/beats/${beat._id}`} key={beat._id} className="beat-row-link">
                <Card className="beats-table-row" padding="none" hover={false} style={gridStyle}>
                  <div className="col-index">
                    <span className="beat-index">{index + 1}</span>
                    <span className="beat-play-icon">▶</span>
                  </div>
                  <div className="col-title">
                    <div className="beat-info">
                      <span className="beat-title-text">{beat.title}</span>
                      <span className="beat-artist-mobile">{beat.artist}</span>
                    </div>
                  </div>
                  {visibleColumns.artist && <div className="col-artist">{beat.artist}</div>}
                  {visibleColumns.bpm && <div className="col-bpm">{beat.bpm}</div>}
                  {visibleColumns.key && <div className="col-key">{beat.key}</div>}
                  {visibleColumns.duration && <div className="col-duration">{beat.formattedDuration}</div>}
                  <div className="col-actions">
                    {visibleColumns.price && <span className="beat-price-tag">{beat.formattedPrice}</span>}
                  </div>
                  <div className="col-cover">
                    <img src={logo} alt="Cover" className="beat-cover-small" />
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
