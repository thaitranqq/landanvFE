import { Link, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';
import '../App.css';

const Login = () => {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const error = urlParams.get('error');

    if (token) {
      localStorage.setItem('jwt_token', token);
      window.location.href = '/'; // Corrected: Redirect to home page
    } else if (error) {
      setLoginError(error);
    }
  }, []);

  const handleGoogleLogin = () => {
    loginWithGoogle();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoginError(null);
    try {
      await login({ email, password });
      navigate('/'); // Corrected: Redirect to home page after successful login
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err ?? 'Đăng nhập thất bại. Vui lòng thử lại.');
      setLoginError(message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-logo">
          <img src={logo} alt="LADANV Logo" className="auth-page-logo" />
        </div>
        <h2 className="auth-title">Đăng nhập vào LADANV</h2>
        {loginError && <div className="auth-error">{loginError}</div>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              placeholder="nhapemail@cuaban.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input 
              type="password" 
              id="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full">Đăng nhập</button>
        </form>

        <div className="auth-divider">
          <span>hoặc</span>
        </div>

        <button
          type="button"
          className="google-auth-button"
          onClick={handleGoogleLogin}
        >
          <img src="https://accounts.google.com/favicon.ico" alt="Google" />
          Đăng nhập với Google
        </button>

        <div className="auth-footer">
          <p>Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
