import React, { useState } from 'react';
import { userService } from '../services/api/UserService';
import { ApiErrorState } from '../components/ApiErrorState';
import LoadingSpinner from '../components/LoadingSpinner';
import '../App.css';

// This interface should be in your types file, but is here for clarity
interface SkinAnalysisResult {
  skinType: string;
  confidence: number;
  analysisMetrics: {
    [key: string]: { score: number; label: string };
  };
  recommendations: {
    ingredients: { focus: string[]; avoid: string[] };
    products: number[];
    lifestyle: string[];
  };
}

const SkinAnalysis = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'success' | 'error'>('idle');
  const [analysisResult, setAnalysisResult] = useState<SkinAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);

      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target!.result as string);
        setStatus('idle');
        setAnalysisResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Map server-side analysis to the UI model. Server may return a compact shape.
  const mapServerToUi = (srv: unknown): SkinAnalysisResult => {
    const asRecord = (v: unknown): Record<string, unknown> => (v as Record<string, unknown> || {});

    const isFullUi = (v: unknown): v is SkinAnalysisResult => {
      const r = asRecord(v);
      return typeof r['skinType'] === 'string' && typeof r['analysisMetrics'] === 'object' && r['analysisMetrics'] !== null;
    };

    if (isFullUi(srv)) {
      const r = srv as SkinAnalysisResult;
      return {
        skinType: r.skinType,
        confidence: typeof r.confidence === 'number' ? r.confidence : 0.8,
        analysisMetrics: r.analysisMetrics,
        recommendations: r.recommendations || { ingredients: { focus: [], avoid: [] }, products: [], lifestyle: [] }
      };
    }
    
    // Fallback for other shapes if necessary, or return a default.
    return {
      skinType: 'Không xác định',
      confidence: 0.5,
      analysisMetrics: { general: { score: 5, label: 'Tổng quan' } },
      recommendations: { ingredients: { focus: [], avoid: [] }, products: [], lifestyle: [] }
    };
  };

  const getErrorMessageFromUnknown = (err: unknown): string => {
    if (!err) return 'Phân tích hình ảnh thất bại. Vui lòng thử lại.';
    if (err instanceof Error) return err.message;
    const e = err as Record<string, unknown>;
    if (typeof e['message'] === 'string') return String(e['message']);
    if (e['original'] && typeof (e['original'] as Record<string, unknown>)['message'] === 'string') return String((e['original'] as Record<string, unknown>)['message']);
    return 'Phân tích hình ảnh thất bại. Vui lòng thử lại.';
  };

  const handleAnalyze = async () => {
    if (!imageFile) return;

    setStatus('analyzing');
    setError(null);
    setAnalysisResult(null);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const srvResult = await userService.analyzeSkinImage(formData);

      const uiResult = mapServerToUi(srvResult);
      setAnalysisResult(uiResult);
      setStatus('success');
    } catch (err: unknown) {
      console.error('Skin analysis failed:', err);
      const msg = getErrorMessageFromUnknown(err);
      setError(msg);
      setStatus('error');
    }
  };

  const renderResult = () => {
    if (!analysisResult) return null;

    return (
      <div className="card result-card animation-slide-in">
        <h4>Kết quả phân tích của bạn</h4>

        <div className="result-overview">
          <div className="result-main-metric">
            <span>Loại da</span>
            <p>{analysisResult.skinType}</p>
          </div>
          <div className="result-main-metric">
            <span>Độ chính xác</span>
            <p>{(analysisResult.confidence * 100).toFixed(0)}%</p>
          </div>
        </div>

        <div className="result-section">
          <h5><i className="fas fa-chart-bar"></i> Phân tích chi tiết</h5>
          <ul className="result-stats">
            {Object.entries(analysisResult.analysisMetrics).map(([key, value]) => (
              <li key={key}>
                <span>{value.label}</span>
                <div className="stat-bar">
                  <div className="stat-bar-fill" style={{ width: `${value.score * 10}%` }}></div>
                </div>
                <span className="stat-score">{value.score}/10</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="result-section">
          <h5><i className="fas fa-flask"></i> Gợi ý thành phần</h5>
          <div className="recommendation-box good">
            <strong>Nên dùng:</strong> {analysisResult.recommendations.ingredients.focus.join(', ')}
          </div>
          <div className="recommendation-box bad">
            <strong>Nên tránh:</strong> {analysisResult.recommendations.ingredients.avoid.join(', ')}
          </div>
        </div>

        <div className="result-section">
          <h5><i className="fas fa-heartbeat"></i> Gợi ý lối sống</h5>
          <ul className="lifestyle-list">
            {analysisResult.recommendations.lifestyle.map(tip => <li key={tip}><i className="fas fa-check-circle"></i>{tip}</li>)}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <main className="main-content">
      <div className="greeting">
        <h2>Phân tích da bằng AI</h2>
        <p>Tải lên hình ảnh da mặt của bạn để nhận phân tích chi tiết và các gợi ý chăm sóc cá nhân hóa.</p>
      </div>

      <div className="analysis-container">
        <div className="card upload-card">
          <h4>1. Tải ảnh lên</h4>
          <div className="upload-area">
            <input type="file" accept="image/*" onChange={handleImageUpload} id="imageUpload" style={{ display: 'none' }} />
            <label htmlFor="imageUpload" className="upload-label">
              {imagePreview ? <img src={imagePreview} alt="Preview" className="image-preview" /> : <i className="fas fa-cloud-upload-alt"></i>}
              <span>{imagePreview ? 'Nhấn để chọn ảnh khác' : 'Nhấn để chọn ảnh hoặc kéo thả'}</span>
            </label>
          </div>
          <button onClick={handleAnalyze} className="btn btn-primary btn-full" disabled={!imageFile || status === 'analyzing'}>
            {status === 'analyzing' ? <><i className="fas fa-spinner fa-spin"></i> Đang phân tích...</> : 'Bắt đầu phân tích'}
          </button>
        </div>

        <div className="analysis-results-area">
            {status === 'analyzing' && <LoadingSpinner message="Đang phân tích, vui lòng chờ..." />}
            {status === 'error' && <ApiErrorState error={error} onRetry={handleAnalyze} />} {/* Removed loading prop */}
            {status === 'success' && analysisResult && renderResult()}
        </div>
      </div>
    </main>
  );
};

export default SkinAnalysis;
