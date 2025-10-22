import React, { useState, useEffect } from 'react';
import { useQa } from '../context/QaContext';
import type { QaItem } from '../context/QaContext';
import '../App.css';

interface ProductQaProps {
  productId: number;
}

const ProductQa: React.FC<ProductQaProps> = ({ productId }) => {
  const { fetchQuestions, submitQuestion } = useQa();
  const [qaItems, setQaItems] = useState<QaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      setError(null);
      try {
        const items = await fetchQuestions(productId);
        setQaItems(items);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err ?? 'Không thể tải được mục Hỏi & Đáp.');
        setError(message || 'Không thể tải được mục Hỏi & Đáp.');
      } finally {
        setLoading(false);
      }
    };
    loadQuestions();
  }, [productId, fetchQuestions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) {
      alert('Vui lòng nhập câu hỏi của bạn.');
      return;
    }
    setIsSubmitting(true);
    try {
      await submitQuestion(productId, newQuestion);
      setNewQuestion(''); // Clear input after successful submission
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err ?? 'Đã có lỗi xảy ra khi gửi câu hỏi.');
      alert(message || 'Đã có lỗi xảy ra khi gửi câu hỏi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="qa-section-container card">
      <h3>Hỏi & Đáp về sản phẩm</h3>

      {/* Form to submit a new question */}
      <form className="qa-submit-form" onSubmit={handleSubmit}>
        <textarea 
          rows={3}
          placeholder="Bạn có câu hỏi gì về sản phẩm này?"
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          disabled={isSubmitting}
        />
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Đang gửi...' : 'Gửi câu hỏi'}
        </button>
      </form>

      {/* List of Q&A items */}
      <div className="qa-list-user">
        {loading && <p>Đang tải câu hỏi...</p>}
        {error && <p className="modal-error">{error}</p>}
        {!loading && !error && (
          qaItems.length > 0 ? (
            qaItems.map(item => (
              <div key={item.id} className="qa-item">
                <div className="qa-question-user">
                  <i className="fas fa-question-circle"></i>
                  <p>{item.question}</p>
                </div>
                {item.answer && (
                  <div className="qa-answer-user">
                    <i className="fas fa-check-circle"></i>
                    <p><strong>LADANV:</strong> {item.answer}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>Chưa có câu hỏi nào cho sản phẩm này. Hãy là người đầu tiên đặt câu hỏi!</p>
          )
        )}
      </div>
    </div>
  );
};

export default ProductQa;
