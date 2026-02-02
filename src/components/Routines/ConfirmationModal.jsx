import React from 'react'
import './Routines.css'

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null

    return (
        <div className="mini-modal-overlay" onClick={onClose}>
            <div className="mini-modal confirmation-modal" onClick={e => e.stopPropagation()}>
                <h4 style={{ color: '#fff', backgroundColor: 'transparent' }}>{title}</h4>
                <p className="modal-message">{message}</p>
                <div className="modal-actions">
                    <button onClick={onClose} className="cancel-btn">Cancelar</button>
                    <button onClick={onConfirm} className="delete-confirm-btn">Eliminar</button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmationModal
