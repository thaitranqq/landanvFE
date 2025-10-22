import React, { useState } from 'react';
import { api } from '../api/api';
import type { Review } from '../data/products';
import '../App.css';

interface ReviewsProps {
  reviews: Review[];
  productId: number;
}

// Add explicit prop types for StarRating
const StarRating: React.FC<{ rating: number; setRating: (r: number) => void; disabled?: boolean }> = ({ rating, setRating, disabled = false }) => {
  return (
    <div className={`star-rating ${disabled ? 'disabled' : ''}`}>
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        return (
          <span 
            key={starValue} 
            className={`star ${starValue <= rating ? 'filled' : ''}`}
            onClick={() => !disabled && setRating(starValue)}
          >
            ★
          </span>
        );
      })}
    </div>
  );
};

const Reviews: React.FC<ReviewsProps> = ({ reviews: initialReviews, productId }) => {
  const [reviews, setReviews] = useState(initialReviews);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
      alert('Vui lòng nhập bình luận của bạn.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Use typed API call so TypeScript knows shape of response.data
      const response = await api.post<Review>('/feedback', {
        productId,
        rating: newRating,
        comment: newComment,
      });

      if (response.success && response.data) {
        // Add the new review returned from the API to the top of the list
        setReviews([response.data, ...reviews]);
        // Reset form
        setNewRating(5);
        setNewComment('');
      } else {
        throw new Error(response.error?.message || 'Không thể gửi đánh giá.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err ?? 'Đã có lỗi xảy ra khi gửi đánh giá của bạn.');
      setSubmitError(message || 'Đã có lỗi xảy ra khi gửi đánh giá của bạn.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="reviews-section card">
      <h3>Đánh giá từ người dùng</h3>

      {/* Form for new review */}
      <form className="review-form" onSubmit={handleSubmit}>
        <h4>Chia sẻ cảm nhận của bạn</h4>
        <div className="form-group">
          <label>Xếp hạng của bạn</label>
          <StarRating rating={newRating} setRating={setNewRating} disabled={isSubmitting} />
        </div>
        <div className="form-group">
          <label htmlFor="comment">Bình luận</label>
          <textarea 
            id="comment"
            rows={4}
            placeholder="Sản phẩm này có tốt không? Bạn có muốn giới thiệu cho người khác?"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        {submitError && <p className="modal-error">{submitError}</p>}
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? <><i className="fas fa-spinner fa-spin"></i> Đang gửi...</> : 'Gửi đánh giá'}
        </button>
      </form>

      {/* List of existing reviews */}
      <div className="reviews-list">
        {reviews.length > 0 ? (
          reviews.map(review => (
            <div key={review.id} className="review-item">
              <div className="review-header">
                {/* FeedbackDTO doesn't include author in types; show userId as fallback */}
                <strong>{review.userId ? `Người dùng ${review.userId}` : 'Người dùng'}</strong>
                <div className="review-stars-display">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`star-display ${i < review.rating ? 'filled' : ''}`}>★</span>
                  ))}
                </div>
              </div>
              <p className="review-comment">{review.comment}</p>
            </div>
          ))
        ) : (
          <div className="info-card" style={{padding: '20px'}}>Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên!</div>
        )}
      </div>
    </div>
  );
};

export default Reviews;
