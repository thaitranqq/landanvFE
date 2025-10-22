import React, { useState } from 'react';
import { api } from '../api/api';
import '../App.css';

const ApiDebugger = () => {
  const [path, setPath] = useState('/auth/signin');
  const [method, setMethod] = useState('POST');
  const [body, setBody] = useState('{\n  "email": "your_email@example.com",\n  "password": "your_password"\n}');
  const [response, setResponse] = useState<unknown | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      let res;
      const parsedBody = method !== 'GET' ? JSON.parse(body) : null;

      if (method === 'POST') {
        res = await api.public.post(path, parsedBody);
      } else {
        // For simplicity, this debugger only supports public POST and private GET
        res = await api.get(path);
      }
      setResponse(res);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err ?? 'An unknown error occurred.');
      setError(message);
      setResponse(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="debugger-container">
      <h1>API Debugger</h1>
      <p>Công cụ này giúp gửi yêu cầu trực tiếp đến API và xem phản hồi thô.</p>
      <form onSubmit={handleSubmit} className="debugger-form">
        <div className="form-group">
          <label>Method</label>
          <select value={method} onChange={e => setMethod(e.target.value)}>
            <option value="POST">POST (Public)</option>
            <option value="GET">GET (Private)</option>
          </select>
        </div>
        <div className="form-group">
          <label>API Path</label>
          <input type="text" value={path} onChange={e => setPath(e.target.value)} />
        </div>
        {method !== 'GET' && (
          <div className="form-group">
            <label>Request Body (JSON)</label>
            <textarea rows={6} value={body} onChange={e => setBody(e.target.value)} />
          </div>
        )}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
        </button>
      </form>

      {(response || error) && (
        <div className="debugger-response">
          <h3>Phản hồi từ Server</h3>
          {error && <pre className="error-output"><strong>Lỗi:</strong> {error}</pre>}
          <h4>Toàn bộ đối tượng phản hồi:</h4>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default ApiDebugger;
