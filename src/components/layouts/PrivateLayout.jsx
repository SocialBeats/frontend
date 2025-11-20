import { Outlet } from 'react-router-dom';
import NavBar from '../ui/NavBar';
import Footer from '../ui/Footer';
import './PrivateLayout.css';

export default function PrivateLayout() {
  return (
    <div className="private-layout">
      {/* Sidebar Navigation - Fixed on the left */}
      <NavBar />

      {/* Main Content Area */}
      <div className="private-content-wrapper">
        <main className="private-main">
          <Outlet />
        </main>

        {/* Footer - Full width but respects sidebar */}
        <Footer />
      </div>
    </div>
  );
}
