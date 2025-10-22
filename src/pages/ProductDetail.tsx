import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { feedbackService } from '../services/api/FeedbackService';
import type { Product, Feedback } from '../types/api';
import LoadingSpinner from '../components/LoadingSpinner';
import PurchaseLinks from '../components/PurchaseLinks';
import StarRating from '../components/StarRating';
import RegulatoryLabelsDisplay from '../components/RegulatoryLabelsDisplay';
import { useAuth } from '../context/AuthContext'; // Import useAuth to get user ID
import '../App.css';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { fetchProductDetails } = useProducts();
  const { user } = useAuth(); // Get current user from AuthContext

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for new feedback form
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const productId = Number(id);
      const [productData, reviewsData] = await Promise.all([
        fetchProductDetails(productId),
        feedbackService.getFeedbackForProduct(productId)
      ]);

      if (!productData) {
        throw new Error('Không thể tải thông tin sản phẩm.');
      }

      setProduct(productData);
      setReviews(reviewsData || []);
    } catch (err) {
      console.error("Failed to load product page data:", err);
      setError('Đã có lỗi xảy ra khi tải trang. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id, fetchProductDetails]);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      setFeedbackError('Bạn cần đăng nhập để gửi đánh giá.');
      return;
    }
    if (newRating === 0) {
      setFeedbackError('Vui lòng chọn số sao đánh giá.');
      return;
    }
    if (!newComment.trim()) {
      setFeedbackError('Vui lòng nhập bình luận của bạn.');
      return;
    }

    setSubmittingFeedback(true);
    setFeedbackError(null);

    try {
      const productId = Number(id);
      const feedbackData = {
        userId: user.id,
        productId: productId,
        rating: newRating,
        comment: newComment.trim(),
        status: 'PENDING' // Assuming new feedback needs to be approved
      };
      await feedbackService.submitFeedback(feedbackData);
      alert('Đánh giá của bạn đã được gửi thành công và đang chờ duyệt!');
      setNewRating(0);
      setNewComment('');
      // Reload reviews to show the new one (if approved immediately or for user to see it pending)
      loadData(); 
    } catch (err) {
      console.error("Failed to submit feedback:", err);
      setFeedbackError('Gửi đánh giá thất bại. Vui lòng thử lại.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Đang tải chi tiết sản phẩm..." />;
  }

  if (error || !product) {
    return (
      <main className="main-content">
        <div className="card info-card">
          <h3>Lỗi</h3>
          <p>{error || 'Không thể hiển thị sản phẩm.'}</p>
          <Link to="/routines" className="btn btn-primary">Quay lại Liệu trình</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="main-content">
      <div className="product-detail-container">
        {/* Product Header Section */}
        <div className="product-header-section card">
          <div className="product-image-large">
            <img src={product.imageUrl} alt={product.name} />
          </div>
          <div className="product-header-details">
            <h1>{product.name}</h1>
            <p className="product-brand">Thương hiệu: {product.brandName}</p>
            <span className="badge badge-category">{product.category}</span>
            {product.recommendationScore !== undefined && (
              <p className="product-score">Điểm phù hợp: <strong>{product.recommendationScore}/10</strong></p>
            )}
            {product.skinTypeScore && Object.keys(product.skinTypeScore).length > 0 && (
              <div className="skin-type-scores">
                <h4>Điểm theo loại da:</h4>
                <ul>
                  {Object.entries(product.skinTypeScore).map(([type, score]) => (
                    <li key={type}><span>{type}:</span> <strong>{score}/10</strong></li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="product-main-content-grid">
          {/* Left Column: Ingredients & Regulatory Labels */}
          <div className="product-left-column">
            <div className="card product-ingredients-section">
              <h4>Thành phần chính</h4>
              <ul className="ingredient-list">
                {product.ingredients && product.ingredients.length > 0 ? (
                  product.ingredients.map(ing => (
                    <li key={ing.id}>{ing.inciName}</li>
                  ))
                ) : (
                  <li>Không có thông tin thành phần.</li>
                )}
              </ul>
            </div>

            {product.regulatoryLabels && product.regulatoryLabels.length > 0 && (
              <div className="card product-regulatory-section">
                <h4>Nhãn quy định</h4>
                <RegulatoryLabelsDisplay labels={product.regulatoryLabels} />
              </div>
            )}
          </div>

          {/* Right Column: Purchase Links */}
          <div className="product-right-column">
            <div className="card product-purchase-section">
              <h4>Nơi mua hàng</h4>
              <PurchaseLinks links={product.purchaseLinks || []} />
            </div>
          </div>
        </div>

        {/* Add Feedback Section */}
        <div className="card add-feedback-section full-width-card">
          <h3>Gửi đánh giá của bạn</h3>
          <form onSubmit={handleSubmitFeedback}>
            <div className="form-group">
              <label>Đánh giá sao:</label>
              <StarRating rating={newRating} onRatingChange={setNewRating} />
            </div>
            <div className="form-group">
              <label htmlFor="comment">Bình luận:</label>
              <textarea
                id="comment"
                rows={4}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                required
              ></textarea>
            </div>
            {feedbackError && <p className="error-message">{feedbackError}</p>}
            <button type="submit" className="btn btn-primary" disabled={submittingFeedback}>
              {submittingFeedback ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </form>
        </div>

        {/* Reviews Section (Moved to bottom) */}
        <div className="card reviews-section full-width-card">
          <h3>Đánh giá từ người dùng ({reviews.length})</h3>
          <div className="reviews-list">
            {reviews && reviews.length > 0 ? (
              reviews.map(review => (
                <div key={review.id} className="review-item">
                  <div className="review-header">
                    <strong>Người dùng #{review.userId}</strong>
                    <StarRating rating={review.rating} disabled />
                  </div>
                  <p className="review-comment">{review.comment}</p>
                  <span className="notification-time">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
              ))
            ) : (
              <p>Chưa có đánh giá nào cho sản phẩm này.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProductDetail;
