// components/Functions/Functions.jsx
import React, { useState, useContext, useCallback } from 'react'
import { ClientContext } from '../../context/ClientContext'
import AddClient from '../AddClient/AddClient'
import Search from '../Search/Search'
// Importar iconos y componente Rutinas
import { FaUserPlus, FaDumbbell } from "react-icons/fa"
import RoutineManager from '../Routines/RoutineManager'
import './Functions.css'

const Functions = ({ onSearchUpdate, filtroEstado, onFilterChange }) => {
    const [showModal, setShowModal] = useState(false)
    const [showRoutines, setShowRoutines] = useState(false) // Nuevo estado

    // Solo pasamos el texto al padre
    const buscarClientes = useCallback((termino) => {
        if (onSearchUpdate) {
            onSearchUpdate(termino)
        }
    }, [onSearchUpdate])

    const limpiarBusqueda = useCallback(() => {
        if (onSearchUpdate) {
            onSearchUpdate("")
        }
    }, [onSearchUpdate])

    const handleOpenModal = () => {
        setShowModal(true)
    }

    const handleCloseModal = () => {
        setShowModal(false)
    }

    const handleAddClient = (newClient) => {
        console.log('Cliente agregado:', newClient)
        setShowModal(false)
    }

    return (
        <div className="functions-container">
            <div className="functions-header">
                <div className="action-buttons" style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        className="btn-add-client"
                        onClick={handleOpenModal}
                        title="Agregar Nuevo Cliente"
                    >
                        <FaUserPlus size={20} />
                        <span style={{ backgroundColor: 'transparent' }}>Agregar Cliente</span>
                    </button>

                    <button
                        className="btn-add-client" // Reusamos clase para estilo consistente
                        onClick={() => setShowRoutines(true)}
                        title="Gestionar Rutinas"
                        style={{ backgroundColor: '#475569' }} // Diferenciar color
                    >
                        <FaDumbbell size={20} />
                        <span style={{ backgroundColor: 'transparent' }}>Rutinas</span>
                    </button>
                </div>

                <Search
                    onBuscar={buscarClientes}
                    onLimpiar={limpiarBusqueda}
                    filtroEstado={filtroEstado}
                    onFilterChange={onFilterChange}
                />
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Agregar Nuevo Cliente</h2>
                            <button
                                className="modal-close"
                                onClick={handleCloseModal}
                            >
                                &times;
                            </button>
                        </div>
                        <div className="modal-body">
                            <AddClient
                                onSuccess={handleAddClient}
                                onClose={handleCloseModal}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Rutinas (Pantalla completa o grande) */}
            {showRoutines && (
                <div className="modal-overlay" onClick={() => setShowRoutines(false)}>
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                        style={{ width: '95%', maxWidth: '1200px', height: '90vh' }}
                    >
                        <RoutineManager onClose={() => setShowRoutines(false)} />
                    </div>
                </div>
            )}
        </div>
    )
}

export default Functions