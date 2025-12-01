import { useState, useCallback, useRef } from 'react'
import { Document, Page, pdfjs, Outline } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import './App.css'

// Set up PDF.js worker using local copy
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

// Annotation types
const ANNOTATION_TYPES = {
  HIGHLIGHT: 'highlight',
  NOTE: 'note',
  STAMP: 'stamp'
}

const STAMP_OPTIONS = ['✓ Approved', '✗ Rejected', '⚠ Draft', '★ Important', '📌 Review']

function App() {
  const [file, setFile] = useState(null)
  const [numPages, setNumPages] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(1.0)
  const [isDragging, setIsDragging] = useState(false)
  
  // Sidebar states
  const [showSidebar, setShowSidebar] = useState(false)
  const [sidebarTab, setSidebarTab] = useState('toc') // 'toc', 'annotations', 'signatures'
  
  // Annotation states
  const [annotations, setAnnotations] = useState([])
  const [annotationMode, setAnnotationMode] = useState(null) // null, 'highlight', 'note', 'stamp'
  const [selectedStamp, setSelectedStamp] = useState(STAMP_OPTIONS[0])
  const [showStampMenu, setShowStampMenu] = useState(false)
  
  // Table of contents
  const [outline, setOutline] = useState(null)
  
  // Signatures
  const [signatures, setSignatures] = useState([])
  
  // Refs
  const documentRef = useRef(null)
  const pageContainerRef = useRef(null)

  const onFileChange = useCallback((event) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setPageNumber(1)
      setAnnotations([])
      setSignatures([])
      setOutline(null)
    }
  }, [])

  const onDocumentLoadSuccess = useCallback(async (pdf) => {
    setNumPages(pdf.numPages)
    
    // Try to get document outline (table of contents)
    try {
      const outlineData = await pdf.getOutline()
      setOutline(outlineData)
    } catch {
      setOutline(null)
    }
    
    // Check for digital signatures
    try {
      const sigInfo = []
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const annotations = await page.getAnnotations()
        const sigAnnotations = annotations.filter(a => a.subtype === 'Widget' && a.fieldType === 'Sig')
        sigAnnotations.forEach(sig => {
          sigInfo.push({
            page: i,
            name: sig.fieldName || 'Unknown',
            rect: sig.rect,
            hasSignature: !!sig.fieldValue
          })
        })
      }
      setSignatures(sigInfo)
    } catch {
      setSignatures([])
    }
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

  // Handle page click for annotations
  const handlePageClick = useCallback((event) => {
    if (!annotationMode || !pageContainerRef.current) return
    
    const rect = pageContainerRef.current.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100
    
    const newAnnotation = {
      id: Date.now(),
      type: annotationMode,
      page: pageNumber,
      x,
      y,
      text: annotationMode === ANNOTATION_TYPES.NOTE ? '' : null,
      stamp: annotationMode === ANNOTATION_TYPES.STAMP ? selectedStamp : null,
      color: annotationMode === ANNOTATION_TYPES.HIGHLIGHT ? '#ffff00' : null,
      createdAt: new Date().toISOString()
    }
    
    if (annotationMode === ANNOTATION_TYPES.NOTE) {
      const noteText = prompt('Enter note text:')
      if (noteText) {
        newAnnotation.text = noteText
        setAnnotations(prev => [...prev, newAnnotation])
      }
    } else {
      setAnnotations(prev => [...prev, newAnnotation])
    }
    
    // Reset mode after adding annotation (except for highlight which might be used multiple times)
    if (annotationMode !== ANNOTATION_TYPES.HIGHLIGHT) {
      setAnnotationMode(null)
    }
  }, [annotationMode, pageNumber, selectedStamp])

  // Delete annotation
  const deleteAnnotation = useCallback((id) => {
    setAnnotations(prev => prev.filter(a => a.id !== id))
  }, [])

  // Navigate to outline item
  const navigateToOutlineItem = useCallback(async (item) => {
    if (item.dest) {
      // For now, just go to page 1 if dest is complex
      // In a full implementation, we'd resolve the destination
      if (typeof item.dest === 'string') {
        // Named destination - would need to resolve
        setPageNumber(1)
      } else if (Array.isArray(item.dest) && item.dest[0]) {
        // Direct page reference
        setPageNumber(1)
      }
    }
    setShowSidebar(false)
  }, [])

  // Render outline items recursively
  const renderOutlineItems = (items, level = 0) => {
    if (!items) return null
    return (
      <ul className="outline-list" style={{ paddingLeft: level * 16 }}>
        {items.map((item, index) => (
          <li key={index} className="outline-item">
            <button 
              className="outline-link"
              onClick={() => navigateToOutlineItem(item)}
            >
              {item.title}
            </button>
            {item.items && renderOutlineItems(item.items, level + 1)}
          </li>
        ))}
      </ul>
    )
  }

  // Get annotations for current page
  const currentPageAnnotations = annotations.filter(a => a.page === pageNumber)

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
          
          {/* Annotation Tools */}
          <div className="toolbar-group annotation-tools">
            <button 
              className={`toolbar-button ${annotationMode === ANNOTATION_TYPES.HIGHLIGHT ? 'active' : ''}`}
              onClick={() => setAnnotationMode(annotationMode === ANNOTATION_TYPES.HIGHLIGHT ? null : ANNOTATION_TYPES.HIGHLIGHT)}
              title="Highlight"
            >
              🖍️ Highlight
            </button>
            <button 
              className={`toolbar-button ${annotationMode === ANNOTATION_TYPES.NOTE ? 'active' : ''}`}
              onClick={() => setAnnotationMode(annotationMode === ANNOTATION_TYPES.NOTE ? null : ANNOTATION_TYPES.NOTE)}
              title="Add Note"
            >
              📝 Note
            </button>
            <div className="stamp-dropdown">
              <button 
                className={`toolbar-button ${annotationMode === ANNOTATION_TYPES.STAMP ? 'active' : ''}`}
                onClick={() => {
                  setShowStampMenu(!showStampMenu)
                  setAnnotationMode(ANNOTATION_TYPES.STAMP)
                }}
                title="Add Stamp"
              >
                🏷️ Stamp ▾
              </button>
              {showStampMenu && (
                <div className="stamp-menu">
                  {STAMP_OPTIONS.map(stamp => (
                    <button 
                      key={stamp}
                      className={`stamp-option ${selectedStamp === stamp ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedStamp(stamp)
                        setShowStampMenu(false)
                      }}
                    >
                      {stamp}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Sidebar Toggle */}
          <div className="toolbar-group">
            <button 
              className={`toolbar-button ${showSidebar ? 'active' : ''}`}
              onClick={() => setShowSidebar(!showSidebar)}
              title="Toggle Sidebar"
            >
              ☰ Panels
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
          <div className="document-layout">
            {/* Sidebar */}
            {showSidebar && (
              <aside className="sidebar">
                <div className="sidebar-tabs">
                  <button 
                    className={`sidebar-tab ${sidebarTab === 'toc' ? 'active' : ''}`}
                    onClick={() => setSidebarTab('toc')}
                  >
                    📑 Contents
                  </button>
                  <button 
                    className={`sidebar-tab ${sidebarTab === 'annotations' ? 'active' : ''}`}
                    onClick={() => setSidebarTab('annotations')}
                  >
                    📝 Annotations
                  </button>
                  <button 
                    className={`sidebar-tab ${sidebarTab === 'signatures' ? 'active' : ''}`}
                    onClick={() => setSidebarTab('signatures')}
                  >
                    🔏 Signatures
                  </button>
                </div>
                
                <div className="sidebar-content">
                  {sidebarTab === 'toc' && (
                    <div className="toc-panel">
                      <h3>Table of Contents</h3>
                      {outline ? (
                        renderOutlineItems(outline)
                      ) : (
                        <p className="empty-message">No table of contents available for this document.</p>
                      )}
                    </div>
                  )}
                  
                  {sidebarTab === 'annotations' && (
                    <div className="annotations-panel">
                      <h3>Annotations ({annotations.length})</h3>
                      {annotations.length === 0 ? (
                        <p className="empty-message">No annotations yet. Use the toolbar to add highlights, notes, or stamps.</p>
                      ) : (
                        <ul className="annotations-list">
                          {annotations.map(annotation => (
                            <li key={annotation.id} className="annotation-item">
                              <div className="annotation-header">
                                <span className="annotation-type">
                                  {annotation.type === ANNOTATION_TYPES.HIGHLIGHT && '🖍️'}
                                  {annotation.type === ANNOTATION_TYPES.NOTE && '📝'}
                                  {annotation.type === ANNOTATION_TYPES.STAMP && '🏷️'}
                                </span>
                                <span className="annotation-page">Page {annotation.page}</span>
                                <button 
                                  className="annotation-delete"
                                  onClick={() => deleteAnnotation(annotation.id)}
                                  title="Delete annotation"
                                >
                                  ✕
                                </button>
                              </div>
                              {annotation.text && (
                                <p className="annotation-text">{annotation.text}</p>
                              )}
                              {annotation.stamp && (
                                <p className="annotation-stamp">{annotation.stamp}</p>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                  
                  {sidebarTab === 'signatures' && (
                    <div className="signatures-panel">
                      <h3>Digital Signatures</h3>
                      {signatures.length === 0 ? (
                        <p className="empty-message">No digital signatures found in this document.</p>
                      ) : (
                        <ul className="signatures-list">
                          {signatures.map((sig, index) => (
                            <li key={index} className="signature-item">
                              <div className="signature-icon">
                                {sig.hasSignature ? '✅' : '⚠️'}
                              </div>
                              <div className="signature-info">
                                <span className="signature-name">{sig.name}</span>
                                <span className="signature-page">Page {sig.page}</span>
                                <span className={`signature-status ${sig.hasSignature ? 'signed' : 'unsigned'}`}>
                                  {sig.hasSignature ? 'Signed' : 'Not signed'}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="signature-note">
                        <p>🔒 Digital signature verification ensures document authenticity and integrity.</p>
                      </div>
                    </div>
                  )}
                </div>
              </aside>
            )}
            
            {/* Document Viewer */}
            <div className="document-container">
              <div 
                className={`page-container ${annotationMode ? 'annotation-mode' : ''}`}
                ref={pageContainerRef}
                onClick={annotationMode ? handlePageClick : undefined}
              >
                <Document
                  file={file}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={<div className="loading">Loading document...</div>}
                  error={<div className="error">Failed to load document</div>}
                  inputRef={documentRef}
                >
                  <Page
                    pageNumber={pageNumber}
                    scale={scale}
                    loading={<div className="loading">Loading page...</div>}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                  />
                </Document>
                
                {/* Render annotations overlay */}
                <div className="annotations-overlay">
                  {currentPageAnnotations.map(annotation => (
                    <div 
                      key={annotation.id}
                      className={`annotation-marker annotation-${annotation.type}`}
                      style={{ 
                        left: `${annotation.x}%`, 
                        top: `${annotation.y}%`
                      }}
                      title={annotation.text || annotation.stamp || 'Highlight'}
                    >
                      {annotation.type === ANNOTATION_TYPES.NOTE && (
                        <span className="note-marker">📝</span>
                      )}
                      {annotation.type === ANNOTATION_TYPES.STAMP && (
                        <span className="stamp-marker">{annotation.stamp}</span>
                      )}
                      {annotation.type === ANNOTATION_TYPES.HIGHLIGHT && (
                        <span className="highlight-marker"></span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Annotation mode indicator */}
              {annotationMode && (
                <div className="annotation-mode-indicator">
                  Click on the document to add a {annotationMode}
                  <button onClick={() => setAnnotationMode(null)}>Cancel</button>
                </div>
              )}
            </div>
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
