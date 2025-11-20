import { Outlet } from 'react-router-dom';
import Footer from '../ui/Footer';
import TopNavBar from '../ui/TopNavBar';
import './PublicLayout.css';

export default function PublicLayout() {
  return (
    <div className="public-layout">
      <TopNavBar />
      <main className="public-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

