import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

const mockedBeats = [
  {
    _id: '1',
    title: 'Summer Vibes',
    artist: 'DJ Producer',
    genre: 'Hip Hop',
    bpm: 120,
    key: 'C#',
    formattedDuration: '3:00',
    description: 'A chill summer beat perfect for relaxing',
    tags: ['chill', 'summer', 'trap'],
  },
  {
    _id: '2',
    title: 'Chill Lo-Fi',
    artist: 'BeatMaker',
    genre: 'Lo-Fi',
    bpm: 90,
    key: 'A#',
    formattedDuration: '2:30',
    description: 'A relaxing lo-fi beat for studying or sleeping.',
    tags: ['lofi', 'chill', 'relax'],
  },
  {
    _id: '3',
    title: 'Trap Banger',
    artist: 'TrapGod',
    genre: 'Trap',
    bpm: 150,
    key: 'G',
    formattedDuration: '2:45',
    description: 'A hard-hitting trap banger for your next hit.',
    tags: ['trap', 'banger', 'hard'],
  },
];

const BeatDetailPage = () => {
  const { id } = useParams();
  const [beat, setBeat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBeat = () => {
      try {
        const foundBeat = mockedBeats.find((b) => b._id === id);
        if (foundBeat) {
          setBeat(foundBeat);
        } else {
          setError('Beat not found.');
        }
      } catch (err) {
        setError('Error fetching beat details. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBeat();
    }
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!beat) {
    return <div>Beat not found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <div className="p-6">
          <h1 className="text-4xl font-bold mb-4">{beat.title}</h1>
          <p className="text-xl text-gray-500 mb-6">{beat.artist}</p>

          <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-6">
            <div>
              <span className="font-semibold">Genre:</span> {beat.genre}
            </div>
            <div>
              <span className="font-semibold">BPM:</span> {beat.bpm}
            </div>
            <div>
              <span className="font-semibold">Key:</span> {beat.key || 'N/A'}
            </div>
            <div>
              <span className="font-semibold">Duration:</span> {beat.formattedDuration}
            </div>
          </div>

          {beat.description && (
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">Description</h2>
              <p>{beat.description}</p>
            </div>
          )}

          {beat.tags && beat.tags.length > 0 && (
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {beat.tags.map((tag) => (
                  <span key={tag} className="bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8">
            <Button>
              Play
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BeatDetailPage;