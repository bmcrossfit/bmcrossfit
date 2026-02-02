// Buttons.js actualizado
import React, { useState, useContext } from 'react'
import { createPortal } from 'react-dom'
import { ClientContext } from '../../context/ClientContext'
import './Buttons.css'
import { FaEdit, FaTrash, FaCalendarPlus } from 'react-icons/fa'
import EditClient from '../EditClient/EditClient'

const Buttons = ({ client, onClientUpdated }) => {
    const {
        eliminarCliente,
        extenderSuscripcion,
        extenderDesdeUltimaFecha,
        loading
    } = useContext(ClientContext)

    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    // Iniciar edición (abrir modal)
    const handleStartEdit = () => {
        setShowEditModal(true)
    }

    // Cerrar modal
    const handleCloseModal = () => {
        setShowEditModal(false)
    }

    // Callback éxito
    const handleEditSuccess = () => {
        if (onClientUpdated) onClientUpdated()
        setShowEditModal(false)
    }

    // En Buttons.js - actualizar handleExtendMonth
    const handleExtendMonth = async () => {
        if (!confirm(`¿Extender un mes la suscripción de ${client.nombre} ${client.apellido}?\n\nLa fecha de inicio se actualizará a hoy y la nueva fecha de vencimiento será dentro de 30 días.`)) {
            return
        }

        const resultado = await extenderSuscripcion(client.id, 1)

        if (resultado.success) {
            alert(`✅ Suscripción extendida 1 mes\n📅 Nueva fecha de inicio: ${resultado.nuevaFechaInicio}\n📅 Nueva fecha de vencimiento: ${resultado.nuevaFechaFin}`)
            if (onClientUpdated) onClientUpdated()
        } else {
            alert(`❌ Error: ${resultado.message}`)
        }
    }

    // Eliminar cliente
    // Eliminar cliente (Lógica ejecutada tras confirmar en modal)
    const handleDelete = async () => {
        const resultado = await eliminarCliente(client.id)

        if (resultado.success) {
            // alert('Cliente eliminado correctamente') // Optional: Toast notification instead?
            setShowDeleteModal(false)
            if (onClientUpdated) onClientUpdated()
        } else {
            alert(`Error: ${resultado.message}`)
        }
    }


    return (
        <>
            <div className="buttons-container">
                <button
                    className="btn btn-edit"
                    onClick={handleStartEdit}
                    disabled={loading}
                    title="Editar cliente"
                >
                    <FaEdit />
                    <span className="btn-label">Editar</span>
                </button>
                <button
                    className="btn btn-extend"
                    onClick={handleExtendMonth}
                    disabled={loading}
                    title="Extender 1 mes"
                >
                    <FaCalendarPlus />
                    <span className="btn-label">+1 Mes</span>
                </button>
                <button
                    className="btn btn-delete"
                    onClick={() => setShowDeleteModal(true)}
                    disabled={loading}
                    title="Eliminar cliente"
                >
                    <FaTrash />
                    <span className="btn-label">Eliminar</span>
                </button>
            </div>

            {/* Modal de edición */}
            {showEditModal && createPortal(
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{client.nombre} {client.apellido}</h2>
                            <button
                                className="modal-close"
                                onClick={handleCloseModal}
                            >
                                &times;
                            </button>
                        </div>
                        <div className="modal-body">
                            <EditClient
                                client={client}
                                onSuccess={handleEditSuccess}
                                onClose={handleCloseModal}
                            />
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Modal de Confirmación de Eliminación */}
            {showDeleteModal && createPortal(
                <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="modal-content" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Eliminar Cliente</h2>
                            <button
                                className="modal-close"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                &times;
                            </button>
                        </div>
                        <div className="modal-body">
                            <p style={{ color: '#cbd5e0', marginBottom: '20px', fontSize: '15px' }}>
                                ¿Estás seguro de que quieres eliminar a <strong>{client.nombre} {client.apellido}</strong>?
                                <br />
                                <span style={{ fontSize: '13px', color: '#fc8181', marginTop: '10px', display: 'block' }}>
                                    Esta acción no se puede deshacer.
                                </span>
                            </p>
                            <div className="form-actions" style={{ justifyContent: 'flex-end', marginTop: '0' }}>
                                <button
                                    className="btn-submit"
                                    onClick={() => setShowDeleteModal(false)}
                                    style={{ background: '#4a5568', boxShadow: 'none' }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    className="btn-cancel"
                                    onClick={handleDelete}
                                >
                                    <FaTrash size={14} /> Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    )
}

export default Buttons