import React from 'react'
import "../components/Modal.css"
function Modal({ onClose,children,className = ""}) {
  return (
    <div className="modal-overlay">
        <div className={`modal-card ${className}`} onClick={(e) => e.stopPropagation()}>
            <button className='close-btn' onClick={onClose}>✕</button>
            {children}
        </div>
    </div>
  )
}

export default Modal
