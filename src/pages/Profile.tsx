import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import LoadingSpinner from '../components/LoadingSpinner';
import '../App.css';

const Profile = () => {
  const { profile, loading, error, updateProfile } = useUser();

  // Local state for form inputs, initialized from the context
  const [skinType, setSkinType] = useState('');
  const [concerns, setConcerns] = useState<string[]>([]);
  const [allergies, setAllergies] = useState('');
  const [isPregnant, setIsPregnant] = useState(false);
  const [goals, setGoals] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false); // New state for edit mode

  // Update local state when profile data is loaded or changes
  useEffect(() => {
    if (profile) {
      setSkinType(profile.skinType);
      setConcerns(profile.concerns);
      setAllergies(profile.allergies.join(', '));
      setIsPregnant(profile.pregnant);
      setGoals(profile.goals);
    }
  }, [profile]);

  const handleConcernChange = (concern: string) => {
    setConcerns(prev => 
      prev.includes(concern) ? prev.filter(c => c !== concern) : [...prev, concern]
    );
  };

  const handleGoalChange = (goal: string) => {
    setGoals(prev => 
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    // Reset local state to current profile values
    if (profile) {
      setSkinType(profile.skinType);
      setConcerns(profile.concerns);
      setAllergies(profile.allergies.join(', '));
      setIsPregnant(profile.pregnant);
      setGoals(profile.goals);
    }
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allergiesArray = allergies.split(',').map(item => item.trim().toLowerCase()).filter(Boolean);
    
    try {
      // Ensure skinType matches API enum before sending
      const apiSkinType = skinType as 'OILY' | 'DRY' | 'COMBINATION' | 'NORMAL' | 'SENSITIVE';
      await updateProfile({ skinType: apiSkinType, concerns, allergies: allergiesArray, pregnant: isPregnant, goals });
      alert('Hồ sơ đã được cập nhật thành công!');
      setIsEditing(false); // Exit edit mode on successful save
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err ?? 'Lỗi cập nhật hồ sơ');
      alert(`Lỗi cập nhật hồ sơ: ${message}`);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Đang tải hồ sơ cá nhân..." />;
  }

  if (error) {
    return (
      <main className="main-content">
        <div className="card info-card full-width-card"><h3><i className="fas fa-exclamation-triangle"></i> Đã xảy ra lỗi</h3><p>{error}</p></div>
      </main>
    );
  }

  // Render the form only if profile data is available
  if (!profile) {
    return (
        <main className="main-content">
            <div className="card info-card full-width-card">
                <h3>Không có dữ liệu hồ sơ</h3>
                <p>Không thể tải hồ sơ người dùng. Vui lòng thử lại sau.</p>
            </div>
        </main>
    );
  }

  const renderSkinType = (type: string) => {
    switch (type) {
      case 'OILY': return 'Da dầu';
      case 'DRY': return 'Da khô';
      case 'COMBINATION': return 'Da hỗn hợp';
      case 'NORMAL': return 'Da thường';
      case 'SENSITIVE': return 'Da nhạy cảm';
      default: return type;
    }
  };

  return (
    <main className="main-content">
      <div className="greeting">
        <h2>Hồ sơ cá nhân</h2>
        <p>Thông tin này sẽ giúp LADANV đưa ra những gợi ý chính xác hơn cho bạn.</p>
      </div>

      <div className="profile-card card">
        <div className="profile-header">
          <h4>Thông tin của bạn</h4>
          {!isEditing && (
            <button onClick={handleEdit} className="btn btn-secondary btn-sm">
              <i className="fas fa-edit"></i> Chỉnh sửa
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h5>Loại da</h5>
            {isEditing ? (
              <div className="radio-group">
                {['OILY', 'DRY', 'COMBINATION', 'NORMAL', 'SENSITIVE'].map(type => (
                  <label key={type} className={`radio-label ${skinType === type ? 'selected' : ''}`}>
                    <input type="radio" name="skinType" value={type} checked={skinType === type} onChange={() => setSkinType(type)} />
                    {renderSkinType(type)}
                  </label>
                ))}
              </div>
            ) : (
              <p className="profile-value">{renderSkinType(profile.skinType)}</p>
            )}
          </div>

          <div className="form-section">
            <h5>Mối quan tâm</h5>
            {isEditing ? (
              <div className="checkbox-group">
                {['Mụn', 'Lão hóa', 'Thâm nám', 'Lỗ chân lông to', 'Da không đều màu'].map(concern => (
                  <label key={concern} className={`checkbox-label ${concerns.includes(concern) ? 'selected' : ''}`}>
                    <input type="checkbox" value={concern} checked={concerns.includes(concern)} onChange={() => handleConcernChange(concern)} />
                    {concern}
                  </label>
                ))}
              </div>
            ) : (
              <p className="profile-value">{profile.concerns.length > 0 ? profile.concerns.join(', ') : 'Chưa có'}</p>
            )}
          </div>

          <div className="form-section">
            <h5>Mục tiêu chăm sóc da</h5>
            {isEditing ? (
              <div className="checkbox-group">
                {['Làm sáng da', 'Chống lão hóa', 'Cải thiện kết cấu da', 'Giảm mụn'].map(goal => (
                  <label key={goal} className={`checkbox-label ${goals.includes(goal) ? 'selected' : ''}`}>
                    <input type="checkbox" value={goal} checked={goals.includes(goal)} onChange={() => handleGoalChange(goal)} />
                    {goal}
                  </label>
                ))}
              </div>
            ) : (
              <p className="profile-value">{profile.goals.length > 0 ? profile.goals.join(', ') : 'Chưa có'}</p>
            )}
          </div>

          <div className="form-section">
            <h5>Thông tin khác</h5>
            {isEditing ? (
              <div className="checkbox-group-vertical">
                <label className="checkbox-label-filter">
                  <input type="checkbox" checked={isPregnant} onChange={(e) => setIsPregnant(e.target.checked)} />
                  Tôi đang trong thời kỳ mang thai
                </label>
              </div>
            ) : (
              <p className="profile-value">{profile.pregnant ? 'Đang mang thai' : 'Không mang thai'}</p>
            )}
          </div>

          <div className="form-section">
            <h5>Dị ứng</h5>
            {isEditing ? (
              <textarea 
                rows={3}
                placeholder="Ví dụ: alcohol, paraben, fragrance..."
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
              />
            ) : (
              <p className="profile-value">{profile.allergies.length > 0 ? profile.allergies.join(', ') : 'Không có'}</p>
            )}
          </div>

          {isEditing && (
            <div className="profile-actions">
              <button type="submit" className="btn btn-primary">Lưu thay đổi</button>
              <button type="button" onClick={handleCancel} className="btn btn-secondary">Hủy</button>
            </div>
          )}
        </form>
      </div>
    </main>
  );
};

export default Profile;
