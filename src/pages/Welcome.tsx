import { Link } from 'react-router-dom';
import logo from '../assets/logo.png'; // Import the logo
import '../App.css';

const Welcome = () => {
  return (
    <div className="welcome-container">
      <div className="welcome-box">
        <div className="welcome-logo">
          <img src={logo} alt="LADANV Logo" className="welcome-page-logo" /> {/* Changed class to welcome-page-logo */}
        </div>
        <h1 className="welcome-title">Chào mừng đến với LADANV</h1> {/* Added a main title */}
        <p className="slogan">Hiểu rõ làn da mình, tự tin chọn đúng điều mình cần.</p>
        <div className="welcome-actions">
          <Link to="/login" className="btn btn-primary btn-full">Đăng nhập</Link>
          <Link to="/register" className="btn btn-secondary btn-full">Tạo tài khoản mới</Link>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
