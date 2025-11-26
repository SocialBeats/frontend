import DashboardCard from './DashboardCard';
import './DashboardList.css';

const DashboardList = ({ dashboards, onDelete, onUpdateName }) => {
  if (dashboards.length === 0) {
    return (
      <div className="dashboard-list--empty">
        <p>No hay dashboards creados. ¡Crea tu primer dashboard!</p>
      </div>
    );
  }

  return (
    <div className="dashboard-list">
      {dashboards.map((dashboard) => (
        <DashboardCard
          key={dashboard.id}
          dashboard={dashboard}
          onDelete={onDelete}
          onUpdateName={onUpdateName}
        />
      ))}
    </div>
  );
};

export default DashboardList;