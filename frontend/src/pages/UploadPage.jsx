import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import uploadAPI from '../api/upload';
import { UploadIcon, FilmIcon, ImageIcon, XIcon, CheckIcon } from '../components/Icons';
import Alert from '../components/Alert';

export default function UploadPage() {
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [form, setForm] = useState({ title: '', description: '', category: 'general', tags: '', visibility: 'public' });
  const [alert, setAlert] = useState(null);
  const inputRef = useRef(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  }, []);

  const handleFile = (selectedFile) => {
    if (!selectedFile.type.startsWith('video/')) {
      setAlert({ type: 'error', message: 'Please select a video file' });
      return;
    }
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    if (!form.title) setForm(prev => ({ ...prev, title: selectedFile.name.replace(/\.[^/.]+$/, '') }));
  };

  const handleUpload = async () => {
    alert('uploadAPI type: ' + typeof uploadAPI);
    alert('uploadAPI.getUploadUrl type: ' + typeof uploadAPI?.getUploadUrl);
    if (!file || !form.title) {
      setAlert({ type: 'error', message: 'Please select a file and enter a title' });
      return;
    }
    setUploading(true);
    setProgress(0);

    try {
      // Step 1: Get upload URL
      const urlRes = await uploadAPI.getUploadUrl({
        filename: file.name,
        contentType: file.type,
      });
      const { uploadUrl, key } = urlRes.data.data;

      alert(`Upload URL:  uploadUrl`);


      // Step 2: Upload to S3
      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
       // headers: { 'Content-Type': file.type },
      });

      // Simulate progress
      const interval = setInterval(() => {
        setProgress(p => {
          if (p >= 90) { clearInterval(interval); return 90; }
          return p + 10;
        });
      }, 300);

      // Step 3: Confirm upload
      await uploadAPI.confirmUpload({
        key,
        title: form.title,
        description: form.description,
        category: form.category,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        visibility: form.visibility,
        duration: 0, // Would be extracted from video
      });

      clearInterval(interval);
      setProgress(100);
      setAlert({ type: 'success', message: 'Upload successful! Processing...' });
      setTimeout(() => navigate('/creator'), 2000);
    } catch (err) {
     // Console.log(err);
      setAlert({ type: 'error', message: JSON.stringify({ name: err.name, message: err.message, stack: err.stack }) });
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="upload-page">
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
      <div className="upload-container">
        <h1 className="upload-title">Upload Video</h1>
        <p className="upload-subtitle">Share your content with the world</p>

        {!file ? (
          <div
            className={`upload-dropzone ${dragActive ? 'dragover' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <div className="upload-dropzone-icon"><UploadIcon size={48} /></div>
            <p className="upload-dropzone-text">Drag and drop your video here</p>
            <p className="upload-dropzone-hint">or click to browse files</p>
            <input ref={inputRef} type="file" accept="video/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </div>
        ) : (
          <div className="upload-form">
            <div className="upload-preview">
              <video src={preview} controls className="w-full h-full object-cover" />
              <button onClick={() => { setFile(null); setPreview(null); }} className="upload-preview-remove">
                <XIcon size={16} />
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Title *</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="form-input" placeholder="Enter video title" required />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="form-input" rows={4} placeholder="Describe your video" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="form-input">
                  <option value="general">General</option>
                  <option value="gaming">Gaming</option>
                  <option value="music">Music</option>
                  <option value="sports">Sports</option>
                  <option value="news">News</option>
                  <option value="tech">Tech</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="education">Education</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Visibility</label>
                <select value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value })} className="form-input">
                  <option value="public">Public</option>
                  <option value="unlisted">Unlisted</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Tags (comma separated)</label>
              <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="form-input" placeholder="gaming, tutorial, fun" />
            </div>

            {uploading && (
              <div className="upload-progress">
                <div className="upload-progress-header">
                  <span className="upload-progress-title">Uploading...</span>
                  <span className="upload-progress-percent">{progress}%</span>
                </div>
                <div className="upload-progress-bar">
                  <div className="upload-progress-fill" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="processing-steps">
                  <div className="processing-step">
                    <div className="processing-step-icon complete"><CheckIcon size={16} /></div>
                    <div className="processing-step-info">
                      <span className="processing-step-label">Uploading file</span>
                      <span className="processing-step-desc">Transferring to server</span>
                    </div>
                  </div>
                  <div className="processing-step">
                    <div className={`processing-step-icon ${progress >= 50 ? 'complete' : 'pending'}`}>
                      {progress >= 50 ? <CheckIcon size={16} /> : <div className="animate-pulse">⏳</div>}
                    </div>
                    <div className="processing-step-info">
                      <span className="processing-step-label">Processing</span>
                      <span className="processing-step-desc">Generating thumbnails and variants</span>
                    </div>
                  </div>
                  <div className="processing-step">
                    <div className={`processing-step-icon ${progress >= 100 ? 'complete' : 'pending'}`}>
                      {progress >= 100 ? <CheckIcon size={16} /> : <div className="animate-pulse">⏳</div>}
                    </div>
                    <div className="processing-step-info">
                      <span className="processing-step-label">Publishing</span>
                      <span className="processing-step-desc">Making video available</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => { setFile(null); setPreview(null); }} className="action-btn" disabled={uploading}>Cancel</button>
              <button onClick={handleUpload} disabled={uploading} className="auth-btn" style={{ width: 'auto', padding: '0.875rem 2rem' }}>
                {uploading ? 'Uploading...' : 'Publish Video'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
