import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRoutines } from '../context/RoutineContext';
import '../App.css';

const Routines = () => {
  const { routines, createRoutine } = useRoutines();
  const [newRoutineTitle, setNewRoutineTitle] = useState('');

  const handleCreateRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoutineTitle.trim()) return;
    createRoutine(newRoutineTitle);
    setNewRoutineTitle(''); // Reset input after creation
  };

  return (
    <main className="main-content">
      <div className="greeting">
        <h2>Liệu trình chăm sóc da</h2>
        <p>Xây dựng và quản lý các thói quen chăm sóc da hàng ngày của bạn.</p>
      </div>

      {/* Form to create a new routine */}
      <form className="card create-routine-form" onSubmit={handleCreateRoutine}>
        <input 
          type="text"
          value={newRoutineTitle}
          onChange={(e) => setNewRoutineTitle(e.target.value)}
          placeholder="Tên liệu trình mới (ví dụ: Chăm sóc da buổi tối)"
        />
        <button type="submit" className="btn btn-primary">Tạo mới</button>
      </form>

      {/* List of existing routines */}
      <div className="routines-grid">
        {routines.map(routine => (
          <Link key={routine.id} to={`/routines/${routine.id}`} className="card routine-card">
            <div className="routine-card-header">
              <i className="fas fa-tasks"></i>
              <h3>{routine.title}</h3>
            </div>
            <div className="routine-card-body">
              <p>{routine.items.length} sản phẩm</p>
              <span className="view-detail-link">Xem chi tiết &rarr;</span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
};

export default Routines;
