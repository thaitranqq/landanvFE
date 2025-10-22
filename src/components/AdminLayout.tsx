import { Outlet, Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import '../App.css';

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div className="admin-header-logo">
          <img src={logo} alt="LADANV Logo" />
          <span>Admin Panel</span>
        </div>
        <Link to="/routines" className="btn btn-secondary">Về trang người dùng</Link>
      </header>
      <main className="admin-main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
