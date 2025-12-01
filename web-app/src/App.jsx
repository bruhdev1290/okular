import { useState, useCallback } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import './App.css'

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

function App() {
  const [file, setFile] = useState(null)
  const [numPages, setNumPages] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(1.0)
  const [isDragging, setIsDragging] = useState(false)

  const onFileChange = useCallback((event) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setPageNumber(1)
    }
  }, [])

  const onDocumentLoadSuccess = useCallback(({ numPages }) => {
    setNumPages(numPages)
  }, [])

  const goToPrevPage = useCallback(() => {
    setPageNumber((prev) => Math.max(prev - 1, 1))
  }, [])

  const goToNextPage = useCallback(() => {
    setPageNumber((prev) => Math.min(prev + 1, numPages || prev))
  }, [numPages])

  const zoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 0.25, 3.0))
  }, [])

  const zoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev - 0.25, 0.5))
  }, [])

  const resetZoom = useCallback(() => {
    setScale(1.0)
  }, [])

  const handleDrop = useCallback((event) => {
    event.preventDefault()
    setIsDragging(false)
    const droppedFile = event.dataTransfer.files?.[0]
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile)
      setPageNumber(1)
    }
  }, [])

  const handleDragOver = useCallback((event) => {
    event.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <h1 className="app-title">Okular Web</h1>
          <span className="app-subtitle">Document Viewer</span>
        </div>
        <div className="header-right">
          <label className="file-input-label">
            <input
              type="file"
              accept=".pdf"
              onChange={onFileChange}
              className="file-input"
            />
            <span className="file-button">Open PDF</span>
          </label>
        </div>
      </header>

      {file && (
        <div className="toolbar">
          <div className="toolbar-group">
            <button onClick={goToPrevPage} disabled={pageNumber <= 1} className="toolbar-button">
              ← Previous
            </button>
            <span className="page-info">
              Page {pageNumber} of {numPages || '?'}
            </span>
            <button onClick={goToNextPage} disabled={pageNumber >= numPages} className="toolbar-button">
              Next →
            </button>
          </div>
          <div className="toolbar-group">
            <button onClick={zoomOut} disabled={scale <= 0.5} className="toolbar-button">
              −
            </button>
            <button onClick={resetZoom} className="toolbar-button zoom-value">
              {Math.round(scale * 100)}%
            </button>
            <button onClick={zoomIn} disabled={scale >= 3.0} className="toolbar-button">
              +
            </button>
          </div>
        </div>
      )}

      <main
        className={`main ${isDragging ? 'dragging' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {!file ? (
          <div className="welcome">
            <div className="welcome-icon">📄</div>
            <h2>Welcome to Okular Web</h2>
            <p>A universal document viewer for the web</p>
            <div className="drop-zone">
              <p>Drag and drop a PDF file here</p>
              <p>or</p>
              <label className="file-input-label large">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={onFileChange}
                  className="file-input"
                />
                <span className="file-button large">Choose a file</span>
              </label>
            </div>
            <div className="features">
              <div className="feature">
                <span className="feature-icon">📱</span>
                <h3>Mobile Friendly</h3>
                <p>Works great on phones and tablets</p>
              </div>
              <div className="feature">
                <span className="feature-icon">🔒</span>
                <h3>Privacy First</h3>
                <p>Documents never leave your device</p>
              </div>
              <div className="feature">
                <span className="feature-icon">⚡</span>
                <h3>Fast & Light</h3>
                <p>No server uploads needed</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="document-container">
            <Document
              file={file}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<div className="loading">Loading document...</div>}
              error={<div className="error">Failed to load document</div>}
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                loading={<div className="loading">Loading page...</div>}
                renderTextLayer={true}
                renderAnnotationLayer={true}
              />
            </Document>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Okular Web - Based on the <a href="https://okular.kde.org" target="_blank" rel="noopener noreferrer">KDE Okular</a> document viewer</p>
      </footer>
    </div>
  )
}

export default App
