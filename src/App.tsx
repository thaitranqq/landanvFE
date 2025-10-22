import { Routes, Route, Outlet } from 'react-router-dom';

// Import Components and Pages
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home'; // Restored Home page
import ProductDetail from './pages/ProductDetail';
import Profile from './pages/Profile';
import Journal from './pages/Journal';
import SkinAnalysis from './pages/SkinAnalysis';
import Routines from './pages/Routines';
import RoutineDetail from './pages/RoutineDetail';
import ApiDebugger from './pages/ApiDebugger';

import './App.css';

// Layout for auth pages (Login, Register)
const AuthLayout = () => (
  <div className="auth-container">
    <Outlet />
  </div>
);

function App() {
  return (
    <Routes>
      {/* === PUBLIC & AUTH ROUTES === */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* === DEBUG ROUTES === */}
      <Route path="/debug/api" element={<ApiDebugger />} />

      {/* === PRIVATE ROUTES (USER) === */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          {/* The Home component is now the main page at the root path */}
          <Route path="/" element={<Home />} /> 
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/skin-analysis" element={<SkinAnalysis />} />
          <Route path="/routines" element={<Routines />} />
          <Route path="/routines/:id" element={<RoutineDetail />} />
        </Route>
      </Route>

    </Routes>
  );
}

export default App;
