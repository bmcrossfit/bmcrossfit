import React from 'react'
import './Routines.css' // Reusing routine styles or create specific ones if needed

const NotificationModal = ({ isOpen, onClose, type = 'success', title, message }) => {
    if (!isOpen) return null

    const isSuccess = type === 'success'
    const headerColor = isSuccess ? '#10b981' : '#ef4444' // Emerald-500 or Red-500

    return (
        <div className="mini-modal-overlay" style={{ zIndex: 1200 }} onClick={onClose}>
            <div className="mini-modal" onClick={e => e.stopPropagation()} style={{ border: `1px solid ${headerColor}` }}>
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ color: headerColor, marginBottom: '0.5rem' }}>{title}</h3>
                    <p style={{ color: '#cbd5e1' }}>{message}</p>
                </div>
                <div className="modal-actions" style={{ justifyContent: 'center' }}>
                    <button
                        onClick={onClose}
                        className="save-btn"
                        style={{ backgroundColor: headerColor, borderColor: headerColor }}
                    >
                        Aceptar
                    </button>
                </div>
            </div>
        </div>
    )
}

export default NotificationModal
