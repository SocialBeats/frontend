import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './components/layouts/PublicLayout';
import PrivateLayout from './components/layouts/PrivateLayout';
import { ProfileProvider } from './contexts/ProfileContext';
import Landing from './pages/Landing';
// import Dashboard from './pages/app/Dashboard';
import BeatsListPage from './pages/app/beats/BeatsListPage';
import MyBeatsListPage from './pages/app/beats/MyBeatsListPage';
import BeatDetailPage from './pages/app/beats/BeatDetailPage';
import BeatFormPage from './pages/app/beats/BeatFormPage';
import Feed from './pages/app/Feed';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ProfileView from './pages/app/profile/ProfileView';
import './styles/App.css';
import DashboardsPage from './pages/app/dashboards/DashboardsPage';
import CreateDashboards from './pages/app/dashboards/CreateDashboards';
import EditDashboard from './pages/app/dashboards/EditDashboard';
import ViewDashboard from './pages/app/dashboards/ViewDashboard';

function App() {
  return (
    <BrowserRouter>
      <ProfileProvider>
        <Routes>
        {/* Public Routes - Accessible to everyone */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/pricing" element={<Landing />} />
          <Route path="/about" element={<Landing />} />
          <Route path="/contact" element={<Landing />} />
        </Route>

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Private Routes - Only for authenticated users */}
        <Route path="/app" element={<PrivateLayout />}>
          {/* <Route path="beats" element={<BeatsListPage />} /> */}
          <Route path="my-beats" element={<MyBeatsListPage />} />
          <Route path="beats/new" element={<BeatFormPage />} />
          <Route path="beats/:id" element={<BeatDetailPage />} />
          <Route path="beats/:id/edit" element={<BeatFormPage />} />
          {/* <Route path="explore" element={<BeatsListPage />} /> TODO: Create Explore page */}

          {/* Redirección inicial al Feed */}
          <Route index element={<Navigate to="/app/feed" replace />} />

          {/* Ruta principal: Feed */}
          <Route path="feed" element={<Feed />} />

          {/* Rutas placeholder apuntando a Feed por ahora */}
          <Route path="explore" element={<Feed />} />
          <Route path="upload" element={<Feed />} />
          <Route path="library" element={<Feed />} />
          <Route path="messages" element={<Feed />} />
          <Route path="profile" element={<ProfileView />} />
          <Route path="profile/:username" element={<ProfileView />} />

          {/* Rutas del microservicio Dashboards */}
          <Route path="/app/dashboards" element={<DashboardsPage />} />
          <Route path="/app/dashboards/create" element={<CreateDashboards />} />
          <Route path="/app/dashboards/view/:id" element={<ViewDashboard />} />
        </Route>

        {/* Catch all - redirect to landing */}
        {/* TODO: Implementar un panic route o página 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </ProfileProvider>
    </BrowserRouter>
  );
}

export default App;
