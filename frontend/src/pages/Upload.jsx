import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { api, setAlert } from '../redux/store'

export default function Upload() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [step, setStep] = useState('select')
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [videoId, setVideoId] = useState(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    visibility: 'public',
    tags: [],
    category: 'general',
    isShort: false
  })
  const [tagInput, setTagInput] = useState('')

  const handleFileSelect = (e) => {
    const selected = e.target.files[0]
    if (!selected) return
    if (!selected.type.startsWith('video/')) {
      dispatch(setAlert({ type: 'error', message: 'Please select a video file' }))
      return
    }
    setFile(selected)
    setPreviewUrl(URL.createObjectURL(selected))
    setStep('details')
    setForm({ ...form, title: selected.name.replace(/\.[^/.]+$/, '') })
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const dropped = e.dataTransfer.files[0]
    if (dropped && dropped.type.startsWith('video/')) {
      setFile(dropped)
      setPreviewUrl(URL.createObjectURL(dropped))
      setStep('details')
      setForm({ ...form, title: dropped.name.replace(/\.[^/.]+$/, '') })
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim()) && form.tags.length < 20) {
      setForm({ ...form, tags: [...form.tags, tagInput.trim()] })
      setTagInput('')
    }
  }

  const removeTag = (tag) => {
    setForm({ ...form, tags: form.tags.filter(t => t !== tag) })
  }

  const handleUpload = async () => {
    if (!form.title.trim()) {
      dispatch(setAlert({ type: 'error', message: 'Title is required' }))
      return
    }
    setUploading(true)
    setStep('uploading')
    try {
      const urlRes = await api.post('/upload/url', {
        filename: file.name,
        contentType: file.type
      })
      const { uploadUrl, key } = urlRes.data.data

      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            setUploadProgress(Math.round((e.loaded / e.total) * 100))
          }
        })
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve()
          else reject(new Error('Upload failed'))
        })
        xhr.addEventListener('error', () => reject(new Error('Upload failed')))
        xhr.open('PUT', uploadUrl)
        xhr.setRequestHeader('Content-Type', file.type)
        xhr.send(file)
      })

      const confirmRes = await api.post('/upload/confirm', {
        key,
        title: form.title,
        description: form.description,
        visibility: form.visibility,
        tags: form.tags,
        category: form.category,
        isShort: form.isShort
      })

      setVideoId(confirmRes.data.data.video._id)
      setStep('processing')
      dispatch(setAlert({ type: 'success', message: 'Upload complete! Processing video...' }))

      const checkStatus = setInterval(async () => {
        try {
          const statusRes = await api.get(`/upload/status/${confirmRes.data.data.video._id}`)
          if (statusRes.data.data.status === 'ready') {
            clearInterval(checkStatus)
            navigate(`/watch/${confirmRes.data.data.video._id}`)
          }
        } catch (err) {
          clearInterval(checkStatus)
        }
      }, 3000)

      setTimeout(() => clearInterval(checkStatus), 300000)
    } catch (err) {
      dispatch(setAlert({ type: 'error', message: err.response?.data?.error || 'Upload failed' }))
      setUploading(false)
      setStep('details')
    }
  }

  return (
    <div className="upload-page">
      <div className="upload-container">
        <div className="upload-header">
          <h1>Upload Video</h1>
          <p>Share your content with the world</p>
        </div>

        {step === 'select' && (
          <div
            className="upload-dropzone"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleFileSelect}
            />
            <div className="upload-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            </div>
            <h3 className="upload-title">Drag and drop video files to upload</h3>
            <p className="upload-subtitle">Your videos will be private until you publish them. MP4, MOV, AVI supported.</p>
          </div>
        )}

        {step === 'details' && (
          <div className="upload-form">
            {previewUrl && (
              <div className="upload-preview">
                <video src={previewUrl} controls className="w-full h-full" />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Title (required)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Add a title that describes your video"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                maxLength={100}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                placeholder="Tell viewers about your video"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                maxLength={5000}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Tags</label>
              <div className="tag-input">
                {form.tags.map(tag => (
                  <span key={tag} className="tag-chip">
                    {tag}
                    <button onClick={() => removeTag(tag)}>&times;</button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder={form.tags.length === 0 ? 'Add tags...' : ''}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="bg-transparent border-none outline-none text-[var(--text-primary)] text-sm flex-1 min-w-[80px]"
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Visibility</label>
              <div className="visibility-options">
                {['public', 'unlisted', 'private'].map(v => (
                  <button
                    key={v}
                    className={`visibility-option ${form.visibility === v ? 'selected' : ''}`}
                    onClick={() => setForm({ ...form, visibility: v })}
                  >
                    <h4 className="capitalize">{v}</h4>
                    <p>{v === 'public' ? 'Everyone can see' : v === 'unlisted' ? 'Anyone with link' : 'Only you'}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button className="btn btn-secondary" onClick={() => { setStep('select'); setFile(null); setPreviewUrl(''); }}>
                Back
              </button>
              <button className="btn btn-primary" onClick={handleUpload} disabled={!form.title.trim()}>
                Upload
              </button>
            </div>
          </div>
        )}

        {step === 'uploading' && (
          <div className="upload-status">
            <div className="spinner mx-auto" style={{ width: '48px', height: '48px' }} />
            <h3>Uploading...</h3>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
            </div>
            <p>{uploadProgress}% complete</p>
          </div>
        )}

        {step === 'processing' && (
          <div className="upload-status">
            <div className="spinner mx-auto" style={{ width: '48px', height: '48px' }} />
            <h3>Processing Video</h3>
            <p>We're generating multiple resolutions and thumbnails. This may take a few minutes.</p>
            <p className="mt-2 text-sm text-[var(--text-muted)]">Video ID: {videoId}</p>
          </div>
        )}
      </div>
    </div>
  )
}
