import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import type { Question } from '../context/AdminContext';
import '../App.css';

const QuestionCard = ({ question }: { question: Question }) => {
  const { answerQuestion } = useAdmin();
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) {
      alert('Vui lòng nhập câu trả lời.');
      return;
    }
    setIsSubmitting(true);
    try {
      await answerQuestion(question.id, answer);
      // The UI will update automatically as the question's `isAnswered` state changes.
    } catch (error) {
      alert('Đã có lỗi xảy ra khi gửi câu trả lời.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`card qa-card ${question.isAnswered ? 'answered' : ''}`}>
      <div className="qa-card-header">
        <p><strong>Người hỏi:</strong> {question.author}</p>
        <p className="qa-time">{new Date(question.createdAt).toLocaleString('vi-VN')}</p>
      </div>
      <p className="qa-question">{question.question}</p>
      {!question.isAnswered && (
        <form onSubmit={handleSubmit} className="qa-answer-form">
          <textarea 
            rows={3} 
            placeholder="Nhập câu trả lời của bạn..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={isSubmitting}
          />
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Đang gửi...' : 'Gửi trả lời'}
          </button>
        </form>
      )}
      {question.isAnswered && (
        <div className="qa-answered-notice">
          <i className="fas fa-check-circle"></i> Đã trả lời
        </div>
      )}
    </div>
  );
}

const AdminQaModeration = () => {
  const { questions, loading } = useAdmin();

  if (loading) {
    return <div>Loading questions...</div>;
  }

  const unansweredQuestions = questions.filter(q => !q.isAnswered);
  const answeredQuestions = questions.filter(q => q.isAnswered);

  return (
    <div className="admin-qa-page">
      <div className="greeting">
        <h2>Kiểm duyệt Hỏi & Đáp</h2>
        <p>Xem và trả lời các câu hỏi từ người dùng.</p>
      </div>

      <div className="qa-section">
        <h3>Câu hỏi mới ({unansweredQuestions.length})</h3>
        <div className="qa-list">
          {unansweredQuestions.length > 0 ? (
            unansweredQuestions.map(q => <QuestionCard key={q.id} question={q} />)
          ) : (
            <p>Không có câu hỏi mới nào.</p>
          )}
        </div>
      </div>

      <div className="qa-section">
        <h3>Đã trả lời ({answeredQuestions.length})</h3>
        <div className="qa-list">
          {answeredQuestions.map(q => <QuestionCard key={q.id} question={q} />)}
        </div>
      </div>
    </div>
  );
};

export default AdminQaModeration;
