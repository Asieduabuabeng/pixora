import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { KeyboardEvent } from 'react'
import './App.css'
import {
  createPhotoComment,
  likePhoto,
  listPhotoComments,
  listPhotos,
  ratePhotoApi,
  unlikePhoto,
  uploadPhoto,
} from './services/photosApi'
import type { NewPhotoInput, Photo, Role } from './types'

function App() {
  const [role, setRole] = useState<Role>('creator')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [view, setView] = useState<
    'login' | 'signup' | 'signup-success' | 'creator' | 'consumer'
  >('login')
  const [photos, setPhotos] = useState<Photo[]>([])
  const [search, setSearch] = useState('')
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('')
  const [authMessage, setAuthMessage] = useState('')
  const [uploadData, setUploadData] = useState<NewPhotoInput>({
    title: '',
    location: '',
    caption: '',
    people: '',
    imageUrl: '',
  })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null)
  const [status, setStatus] = useState('')
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(true)
  const [photosError, setPhotosError] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [selectedPhotoId, setSelectedPhotoId] = useState<number | null>(null)
  const [commentText, setCommentText] = useState('')
  const [pendingLikePhotoId, setPendingLikePhotoId] = useState<number | null>(null)
  const [pendingRatingPhotoId, setPendingRatingPhotoId] = useState<number | null>(null)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  useEffect(() => {
    const loadPhotos = async () => {
      setIsLoadingPhotos(true)
      setPhotosError('')
      try {
        const items = await listPhotos()
        setPhotos(items)
      } catch {
        setPhotosError('We could not refresh photos right now.')
        setStatus('Unable to load photos from API. Showing offline sample data.')
      } finally {
        setIsLoadingPhotos(false)
      }
    }
    void loadPhotos()
  }, [])

  useEffect(() => {
    if (!status) return
    const timer = window.setTimeout(() => setStatus(''), 3000)
    return () => window.clearTimeout(timer)
  }, [status])

  useEffect(() => {
    if (!selectedPhotoId) return
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setSelectedPhotoId(null)
      setCommentText('')
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [selectedPhotoId])

  useEffect(
    () => () => {
      if (selectedImagePreview) URL.revokeObjectURL(selectedImagePreview)
    },
    [selectedImagePreview],
  )

  const filteredPhotos = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return photos
    return photos.filter((photo) =>
      [photo.title, photo.caption, photo.location, photo.creatorName, photo.people, ...photo.tags, ...photo.aiTags]
        .join(' ')
        .toLowerCase()
        .includes(q),
    )
  }, [photos, search])

  const selectedPhoto = useMemo(
    () => photos.find((photo) => photo.id === selectedPhotoId) ?? null,
    [photos, selectedPhotoId],
  )

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      setAuthMessage('Enter your email and password to continue.')
      return
    }
    setAuthMessage('')
    setView(role === 'creator' ? 'creator' : 'consumer')
  }

  const handleLogout = () => {
    setView('login')
    setEmail('')
    setPassword('')
    setAuthMessage('')
  }

  const handleSignup = () => {
    if (!signupName.trim() || !signupEmail.trim() || !signupPassword.trim()) {
      setAuthMessage('Please complete all sign up fields.')
      return
    }
    if (signupPassword !== signupConfirmPassword) {
      setAuthMessage('Passwords do not match.')
      return
    }

    setAuthMessage('')
    setRole('consumer')
    setEmail(signupEmail)
    setPassword('')
    setView('signup-success')
    setSignupName('')
    setSignupEmail('')
    setSignupPassword('')
    setSignupConfirmPassword('')
  }

  const continueFromSignup = () => {
    setView('consumer')
    setStatus('Account created successfully.')
  }

  const handleUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedImage || !selectedImagePreview) {
      setStatus('Please choose an image to upload.')
      return
    }
    if (!uploadData.title || !uploadData.location || !uploadData.caption) {
      setStatus('Title, location and caption are required.')
      return
    }

    setIsUploading(true)
    try {
      const created = await uploadPhoto({
        ...uploadData,
        imageUrl: selectedImagePreview,
      })
      const withImage: Photo = {
        ...created,
        imageUrl: selectedImagePreview ?? created.imageUrl,
      }
      setPhotos((current) => [withImage, ...current])
      setUploadData({ title: '', location: '', caption: '', people: '', imageUrl: '' })
      setSelectedImage(null)
      setSelectedImagePreview(null)
      setStatus('Photo uploaded successfully.')
    } catch {
      setStatus('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleImageSelection = (file: File | null) => {
    setSelectedImage(file)
    setSelectedImagePreview((current) => {
      if (current) URL.revokeObjectURL(current)
      return file ? URL.createObjectURL(file) : null
    })
  }

  const toggleLike = (photoId: number) => {
    const target = photos.find((photo) => photo.id === photoId)
    if (!target) return

    setPendingLikePhotoId(photoId)
    const request = target.liked ? unlikePhoto(target) : likePhoto(target)
    void request
      .then((result) => {
        setPhotos((current) =>
          current.map((photo) =>
            photo.id === photoId
              ? { ...photo, liked: result.liked, likes: result.likes }
              : photo,
          ),
        )
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Could not update like right now.'
        setStatus(message)
      })
      .finally(() => {
        setPendingLikePhotoId((current) => (current === photoId ? null : current))
      })
  }

  const ratePhoto = (photoId: number, rating: number) => {
    const target = photos.find((photo) => photo.id === photoId)
    if (!target) return

    setPendingRatingPhotoId(photoId)
    setPhotos((current) =>
      current.map((photo) => (photo.id === photoId ? { ...photo, rating } : photo)),
    )

    void ratePhotoApi(target, rating)
      .then((ratingAvg) => {
        setPhotos((current) =>
          current.map((photo) =>
            photo.id === photoId ? { ...photo, rating: ratingAvg } : photo,
          ),
        )
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Could not submit rating right now.'
        setStatus(message)
      })
      .finally(() => {
        setPendingRatingPhotoId((current) => (current === photoId ? null : current))
      })
  }

  const submitComment = () => {
    const message = commentText.trim()
    if (!message || !selectedPhotoId) return
    const targetPhotoId = selectedPhotoId
    const target = photos.find((photo) => photo.id === targetPhotoId)
    if (!target) return
    const author = email.split('@')[0] || 'You'

    // Optimistically update comments so count/UI responds instantly.
    setPhotos((current) =>
      current.map((photo) =>
        photo.id === targetPhotoId
          ? {
              ...photo,
              comments: [...photo.comments, { author, text: message }],
              commentsCount: (photo.commentsCount ?? photo.comments.length) + 1,
            }
          : photo,
      ),
    )
    setCommentText('')
    setIsSubmittingComment(true)
    void createPhotoComment(target, message, author)
      .then((comments) => {
        setPhotos((current) =>
          current.map((photo) =>
            photo.id === targetPhotoId
              ? { ...photo, comments, commentsCount: comments.length }
              : photo,
          ),
        )
      })
      .catch((error: unknown) => {
        const errorMessage =
          error instanceof Error ? error.message : 'Could not post comment right now.'
        setStatus(errorMessage)
      })
      .finally(() => {
        setIsSubmittingComment(false)
      })
  }

  const closeModal = () => {
    setSelectedPhotoId(null)
    setCommentText('')
  }

  const handleCommentKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return
    event.preventDefault()
    submitComment()
  }

  useEffect(() => {
    if (!selectedPhotoId) return
    const target = photos.find((photo) => photo.id === selectedPhotoId)
    if (!target) return

    void listPhotoComments(target)
      .then((comments) => {
        setPhotos((current) =>
          current.map((photo) =>
            photo.id === selectedPhotoId
              ? { ...photo, comments, commentsCount: comments.length }
              : photo,
          ),
        )
      })
      .catch(() => {
        // Keep existing comments if request fails.
      })
  }, [selectedPhotoId])

  return (
    <main className="app-shell">
      {view === 'login' ? (
        <section className="login-view">
          <div className="login-card">
            <h1 className="logo">Pixora</h1>
            <p className="tagline">
              {role === 'creator'
                ? 'Upload and manage your photo stories. Creator accounts are provisioned by admin.'
                : 'Explore and engage with visual stories.'}
            </p>
            <div className="role-toggle">
              <button
                className={role === 'creator' ? 'active' : ''}
                onClick={() => setRole('creator')}
                type="button"
              >
                Creator
              </button>
              <button
                className={role === 'consumer' ? 'active' : ''}
                onClick={() => setRole('consumer')}
                type="button"
              >
                Consumer
              </button>
            </div>
            <label>
              Email
              <input
                type="email"
                value={email}
                placeholder="you@example.com"
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                placeholder="••••••••"
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            {authMessage ? <p className="auth-message">{authMessage}</p> : null}
            <button className="primary" type="button" onClick={handleLogin}>
              Enter
            </button>
            {role === 'consumer' ? (
              <button className="secondary" type="button" onClick={() => setView('signup')}>
                Sign up
              </button>
            ) : null}
          </div>
        </section>
      ) : view === 'signup' ? (
        <section className="login-view">
          <div className="login-card">
            <h1 className="logo">Pixora</h1>
            <p className="tagline">Create a consumer account to get started.</p>
            <label>
              Full name
              <input
                type="text"
                value={signupName}
                placeholder="Your name"
                onChange={(event) => setSignupName(event.target.value)}
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={signupEmail}
                placeholder="you@example.com"
                onChange={(event) => setSignupEmail(event.target.value)}
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={signupPassword}
                placeholder="••••••••"
                onChange={(event) => setSignupPassword(event.target.value)}
              />
            </label>
            <label>
              Confirm password
              <input
                type="password"
                value={signupConfirmPassword}
                placeholder="••••••••"
                onChange={(event) => setSignupConfirmPassword(event.target.value)}
              />
            </label>
            {authMessage ? <p className="auth-message">{authMessage}</p> : null}
            <button className="primary" type="button" onClick={handleSignup}>
              Create consumer account
            </button>
            <button
              className="secondary"
              type="button"
              onClick={() => {
                setAuthMessage('')
                setView('login')
              }}
            >
              Back to sign in
            </button>
          </div>
        </section>
      ) : view === 'signup-success' ? (
        <section className="login-view">
          <div className="login-card">
            <h1 className="logo">Pixora</h1>
            <p className="tagline">Your account is ready.</p>
            <div className="success-mark" aria-hidden>
              ✓
            </div>
            <p className="support">
              Welcome aboard. Continue to your explore feed.
            </p>
            <button className="primary" type="button" onClick={continueFromSignup}>
              Continue
            </button>
          </div>
        </section>
      ) : (
        <section className="workspace-view">
          <header className="top-nav">
            <h1 className="logo">Pixora</h1>
            <div className="top-nav-actions">
              <span className={`badge ${role}`}>{role}</span>
              <button type="button" onClick={handleLogout}>
                Sign out
              </button>
            </div>
          </header>

          {view === 'creator' ? (
            <div className="page-body creator-layout">
              <form className="card upload-card" onSubmit={handleUpload}>
                <h2>Upload photo</h2>
                <label>
                  Image
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(event) => handleImageSelection(event.target.files?.[0] ?? null)}
                  />
                </label>
                {selectedImage ? <small>Selected: {selectedImage.name}</small> : null}
                {selectedImagePreview ? (
                  <img className="upload-preview" src={selectedImagePreview} alt="Selected upload preview" />
                ) : null}
                <label>
                  Title
                  <input
                    value={uploadData.title}
                    onChange={(event) =>
                      setUploadData((current) => ({ ...current, title: event.target.value }))
                    }
                  />
                </label>
                <label>
                  Location
                  <input
                    value={uploadData.location}
                    onChange={(event) =>
                      setUploadData((current) => ({ ...current, location: event.target.value }))
                    }
                  />
                </label>
                <label>
                  Caption
                  <textarea
                    value={uploadData.caption}
                    onChange={(event) =>
                      setUploadData((current) => ({ ...current, caption: event.target.value }))
                    }
                  />
                </label>
                <label>
                  People present
                  <input
                    value={uploadData.people}
                    onChange={(event) =>
                      setUploadData((current) => ({ ...current, people: event.target.value }))
                    }
                  />
                </label>
                <button className="primary" type="submit" disabled={isUploading}>
                  {isUploading ? 'Uploading...' : 'Upload'}
                </button>
              </form>
              <div className="card">
                <h2>My uploads</h2>
                <p className="support">{photos.length} photos</p>
                <div className="photo-grid">
                  {photos.map((photo) => (
                    <article className="photo-card" key={photo.id}>
                      {photo.imageUrl ? (
                        <img className="photo-image" src={photo.imageUrl} alt={photo.title} />
                      ) : (
                        <div className="photo-placeholder">{photo.placeholder}</div>
                      )}
                      <strong>{photo.title}</strong>
                      <small>{photo.location}</small>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="page-body">
              <div className="search-row">
                <input
                  placeholder="Search by creator, title, caption, location, tags"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
              {photosError ? <p className="support">{photosError}</p> : null}
              {isLoadingPhotos ? <p className="support">Loading photos...</p> : null}
              {!isLoadingPhotos && filteredPhotos.length === 0 ? (
                <p className="support">No photos match your search yet.</p>
              ) : null}
              <div className="consumer-grid">
                {filteredPhotos.map((photo) => (
                  <article
                    className="card consumer-card"
                    key={photo.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedPhotoId(photo.id)}
                    onKeyDown={(event) => {
                      if (event.key !== 'Enter' && event.key !== ' ') return
                      event.preventDefault()
                      setSelectedPhotoId(photo.id)
                    }}
                  >
                    <button
                      type="button"
                      className="photo-open"
                      onClick={() => setSelectedPhotoId(photo.id)}
                    >
                      {photo.imageUrl ? (
                        <img className="photo-image large" src={photo.imageUrl} alt={photo.title} />
                      ) : (
                        <div className="photo-placeholder large">{photo.placeholder}</div>
                      )}
                    </button>
                    <h2>{photo.title}</h2>
                    <p>{photo.caption}</p>
                    <small>By {photo.creatorName}</small>
                    <small>{photo.location}</small>
                    <div className="card-actions">
                      <button
                        type="button"
                        className={`chip ${photo.liked ? 'active' : ''}`}
                        disabled={pendingLikePhotoId === photo.id}
                        onClick={(event) => {
                          event.stopPropagation()
                          toggleLike(photo.id)
                        }}
                      >
                        {photo.liked ? 'Liked' : 'Like'} · {photo.likes}
                      </button>
                      <button
                        type="button"
                        className="chip"
                        onClick={(event) => {
                          event.stopPropagation()
                          setSelectedPhotoId(photo.id)
                        }}
                      >
                        Comments · {photo.commentsCount ?? photo.comments.length}
                      </button>
                      <div className="rating-group">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            className={`star-btn ${star <= Math.round(photo.rating) ? 'on' : ''}`}
                            disabled={pendingRatingPhotoId === photo.id}
                            onClick={(event) => {
                              event.stopPropagation()
                              ratePhoto(photo.id, star)
                            }}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
      {selectedPhoto ? (
        <div className="modal-overlay" role="dialog" aria-modal="true" onClick={closeModal}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="modal-close"
              onClick={closeModal}
            >
              ×
            </button>
            {selectedPhoto.imageUrl ? (
              <img className="photo-image large" src={selectedPhoto.imageUrl} alt={selectedPhoto.title} />
            ) : (
              <div className="photo-placeholder large">{selectedPhoto.placeholder}</div>
            )}
            <h2>{selectedPhoto.title}</h2>
            <p>{selectedPhoto.caption}</p>
            <small>
              By {selectedPhoto.creatorName} · {selectedPhoto.location}
            </small>
            <div className="modal-comments">
              <h3>Comments</h3>
              {selectedPhoto.comments.length ? (
                selectedPhoto.comments.map((comment, index) => (
                  <p key={`${comment.author}-${index}`} className="comment-line">
                    <strong>{comment.author}:</strong> {comment.text}
                  </p>
                ))
              ) : (
                <p className="support">No comments yet.</p>
              )}
            </div>
            <div className="comment-form">
              <input
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                placeholder="Write a comment..."
                onKeyDown={handleCommentKeyDown}
                disabled={isSubmittingComment}
              />
              <button
                type="button"
                className="primary"
                onClick={submitComment}
                disabled={isSubmittingComment || !commentText.trim()}
              >
                {isSubmittingComment ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {status ? <aside className="toast">{status}</aside> : null}
    </main>
  )
}

export default App
