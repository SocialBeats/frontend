import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './components/layouts/PublicLayout';
import PrivateLayout from './components/layouts/PrivateLayout';
import Landing from './pages/Landing';
import Dashboard from './pages/app/Dashboard';
import BeatsListPage from './pages/app/beats/BeatsListPage';
import BeatDetailPage from './pages/app/beats/BeatDetailPage';
import './styles/App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes - Accessible to everyone */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/pricing" element={<Landing />} /> {/* TODO: Create Pricing page */}
          <Route path="/about" element={<Landing />} /> {/* TODO: Create About page */}
          <Route path="/contact" element={<Landing />} /> {/* TODO: Create Contact page */}
        </Route>

        {/* Private Routes - Only for authenticated users (will be protected with auth) */}
        <Route path="/app" element={<PrivateLayout />}>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="beats" element={<BeatsListPage />} />
          <Route path="beats/:id" element={<BeatDetailPage />} />
          <Route path="explore" element={<Dashboard />} /> {/* TODO: Create Explore page */}
          <Route path="upload" element={<Dashboard />} /> {/* TODO: Create Upload page */}
          <Route path="library" element={<Dashboard />} /> {/* TODO: Create Library page */}
          <Route path="messages" element={<Dashboard />} /> {/* TODO: Create Messages page */}
          <Route path="profile" element={<Dashboard />} /> {/* TODO: Create Profile page */}
        </Route>

        {/* Catch all - redirect to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
