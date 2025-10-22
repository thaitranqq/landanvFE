import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../hooks/useProducts';
import { useModal } from '../context/ModalContext';
import { useAlerts } from '../context/AlertContext';
import BarcodeScannerModal from './BarcodeScannerModal';
import AddToRoutineModal from './AddToRoutineModal';
import SetScheduleModal from './SetScheduleModal';
import IngredientDetailModal from './IngredientDetailModal';
import NotificationDropdown from './NotificationDropdown';
import logo from '../assets/logo.png';
import '../App.css';

interface NavLinkProps {
  to: string;
  icon: string;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

const NavLink: React.FC<NavLinkProps> = ({ to, icon, children, onClick }) => {
  const location = useLocation();
  const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  if (onClick) {
    return (
      <li>
        <a href="#" onClick={onClick}><i className={icon}></i> {children}</a>
      </li>
    );
  }

  return (
    <li className={isActive ? 'active' : ''}>
      <Link to={to}><i className={icon}></i> {children}</Link>
    </li>
  );
};

function Layout() {
  const { logout } = useAuth();
  const { searchQuery, setSearchQuery } = useProducts();
  const { openBarcodeModal } = useModal();
  const { unreadCount } = useAlerts();
  const navigate = useNavigate();
  const location = useLocation(); // Get current location
  const [isNotificationOpen, setNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement | null>(null);

  // Determine if the search bar should be visible
  const showSearchBar = location.pathname === '/';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && event.target && notificationRef.current.contains(event.target as Node)) {
        // click was inside
      } else {
        setNotificationOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notificationRef]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleScanClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    openBarcodeModal();
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src={logo} alt="LADANV Logo" />
        </div>
        <nav className="sidebar-nav">
          <ul>
            <NavLink to="/" icon="fas fa-home">Trang chủ</NavLink>
            <NavLink to="/routines" icon="fas fa-tasks">Liệu trình</NavLink>
            <NavLink to="#" icon="fas fa-barcode" onClick={handleScanClick}>Quét mã sản phẩm</NavLink>
            <NavLink to="/skin-analysis" icon="fas fa-camera">Phân tích da</NavLink>
            <NavLink to="/journal" icon="fas fa-book-medical">Nhật ký chăm sóc</NavLink>
            <NavLink to="/profile" icon="fas fa-user-circle">Hồ sơ cá nhân</NavLink>
          </ul>
        </nav>
        <div className="sidebar-footer">
            <button onClick={handleLogout} className="logout-button">
                <i className="fas fa-sign-out-alt"></i>
                <span>Đăng xuất</span>
            </button>
        </div>
      </aside>

      <div className="main-container">
        <header className="main-header">
          {showSearchBar ? (
            <div className="search-bar">
              <i className="fas fa-search"></i>
              <input 
                type="text" 
                placeholder="Nhập tên sản phẩm hoặc thương hiệu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          ) : (
            // Add a placeholder to keep the header layout consistent
            <div style={{ flexGrow: 1 }}></div>
          )}
          <div className="header-actions">
            <div className="notification-area" ref={notificationRef}>
              <button onClick={() => setNotificationOpen(!isNotificationOpen)} className="notification-btn">
                <i className="fas fa-bell"></i>
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
              </button>
              <NotificationDropdown isOpen={isNotificationOpen} onClose={() => setNotificationOpen(false)} />
            </div>
          </div>
        </header>
        <Outlet />
      </div>
      
      <BarcodeScannerModal />
      <AddToRoutineModal />
      <SetScheduleModal />
      <IngredientDetailModal />
    </div>
  );
}

export default Layout;
