import React, { useState } from 'react';
import { useJournal } from '../context/JournalContext';
import type { JournalEntryCreateRequest } from '../types/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { ApiErrorState } from '../components/ApiErrorState';
import '../App.css';

const Journal = () => {
  const { entries, loading, error, createJournalEntry, deleteJournalEntry } = useJournal();
  
  // State for the new entry form
  const [newEntry, setNewEntry] = useState<Omit<JournalEntryCreateRequest, 'userId'>>({ date: new Date().toISOString().split('T')[0], textNote: '' });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for the accordion
  const [expandedEntryId, setExpandedEntryId] = useState<number | null>(null);

  // State for the lightbox
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewEntry(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles(prev => [...prev, ...files]);

      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntry.date || !newEntry.textNote?.trim()) {
      alert('Vui lòng nhập ngày và nội dung ghi chú.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createJournalEntry(newEntry, imageFiles);
      
      setNewEntry({ date: new Date().toISOString().split('T')[0], textNote: '' });
      setImageFiles([]);
      setImagePreviews([]);

    } catch (err) {
      // Error is handled in the context
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleEntry = (id: number) => {
    setExpandedEntryId(prevId => (prevId === id ? null : id));
  };

  const openLightbox = (e: React.MouseEvent, url: string) => {
    e.stopPropagation(); // Prevent accordion from toggling
    setSelectedImageUrl(url);
  };

  const closeLightbox = () => {
    setSelectedImageUrl(null);
  };

  return (
    <main className="main-content">
      <div className="greeting">
        <h2>Nhật ký chăm sóc da</h2>
        <p>Theo dõi hành trình chăm sóc da, ghi chú lại các thay đổi và cảm nhận của bạn.</p>
      </div>

      <div className="journal-container">
        {/* ... form code remains the same ... */}
        <div className="card journal-form">
          <h4>Thêm ghi chú mới</h4>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="date">Ngày</label>
              <input 
                type="date" 
                id="date" 
                name="date" 
                value={newEntry.date}
                onChange={handleTextChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="textNote">Ghi chú</label>
              <textarea 
                id="textNote" 
                name="textNote"
                rows={4}
                placeholder="Hôm nay da của bạn thế nào? Bạn đã dùng sản phẩm gì?"
                value={newEntry.textNote || ''}
                onChange={handleTextChange}
                required
              />
            </div>

            <div className="form-group">
                <label>Thêm ảnh (tùy chọn)</label>
                <div className="image-upload-preview-container">
                    {imagePreviews.map((preview, index) => (
                        <div key={index} className="image-preview-item">
                            <img src={preview} alt={`preview ${index}`} />
                            <button type="button" onClick={() => removeImage(index)}>&times;</button>
                        </div>
                    ))}
                    <label htmlFor="imageUpload" className="add-image-btn">
                        <i className="fas fa-plus"></i>
                    </label>
                </div>
                <input 
                    type="file" 
                    id="imageUpload" 
                    multiple 
                    accept="image/*" 
                    onChange={handleImageChange} 
                    style={{ display: 'none' }}
                />
            </div>

            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? <><i className="fas fa-spinner fa-spin"></i> Đang lưu...</> : 'Lưu ghi chú'}
            </button>
          </form>
        </div>

        {loading && <LoadingSpinner message="Đang tải nhật ký..." />}
        {error && !loading && <ApiErrorState error={error} />}

        {!loading && !error && (
          <div className="journal-list">
            <h3>Các ghi chú trước đây</h3>
            {entries.length > 0 ? (
              entries.map(entry => (
                <div key={entry.id} className={`journal-entry-accordion ${expandedEntryId === entry.id ? 'expanded' : ''}`}>
                  <div className="journal-entry-header" onClick={() => toggleEntry(entry.id)}>
                    <span className="entry-date">{new Date(entry.date).toLocaleDateString('vi-VN')}</span>
                    <div className="entry-actions">
                      <button onClick={(e) => { e.stopPropagation(); deleteJournalEntry(entry.id); }} className="btn-icon delete-btn" title="Xóa ghi chú">
                        <i className="fas fa-trash"></i>
                      </button>
                      <i className={`fas fa-chevron-down expand-icon ${expandedEntryId === entry.id ? 'rotated' : ''}`}></i>
                    </div>
                  </div>
                  <div className="journal-entry-content">
                    <p className="entry-notes">{entry.textNote}</p>
                    {entry.photos && entry.photos.length > 0 && (
                        <div className="journal-image-gallery">
                            {entry.photos.map(photo => (
                                <img 
                                  key={photo.id} 
                                  src={photo.url} 
                                  alt={`Journal photo ${photo.id}`} 
                                  onClick={(e) => openLightbox(e, photo.url)}
                                />
                            ))}
                        </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="card info-card">
                <p>Chưa có ghi chú nào. Hãy bắt đầu theo dõi làn da của bạn ngay hôm nay!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImageUrl && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <span className="lightbox-close-btn">&times;</span>
          <img src={selectedImageUrl} alt="Enlarged view" className="lightbox-image" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </main>
  );
};

export default Journal;
