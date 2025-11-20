import { Outlet } from 'react-router-dom';
import Footer from '../ui/Footer';
import './PublicLayout.css';

export default function PublicLayout() {
  return (
    <div className="public-layout">
      <main className="public-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
