import React, { useContext, useState } from 'react'
import { RoutineContext } from '../../context/RoutineContext'
import ConfirmationModal from './ConfirmationModal'
import { FaPlus, FaTrash, FaChevronDown, FaChevronUp } from 'react-icons/fa'
import './Routines.css'
import NotificationModal from './NotificationModal'

const WeeklyView = () => {
    const {
        currentRoutine,
        savedRoutines,
        exercises,
        updateCurrentRoutineDay,
        updateCurrentRoutineMeta,
        loadRoutineToEdit,
        clearCurrentRoutine,
        saveRoutine,
        deleteRoutine
    } = useContext(RoutineContext)

    const [selectedDay, setSelectedDay] = useState(null)
    const [selectedExerciseId, setSelectedExerciseId] = useState('')
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    const [expandedItem, setExpandedItem] = useState(null)


    // Filtros locales para el selector
    const [selectedDiscipline, setSelectedDiscipline] = useState('Funcional')

    const days = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes']
    const disciplines = ['Funcional', 'Musculación', 'Crossfit']

    const toggleExpand = (day, index) => {
        const key = `${day}-${index}`
        setExpandedItem(prev => (prev === key ? null : key))
    }



    // Manejar cambio de disciplina en el filtro principal
    const handleDisciplineChange = (e) => {
        const newDiscipline = e.target.value
        setSelectedDiscipline(newDiscipline)
        // Limpiamos la rutina actual para empezar de cero en la nueva disciplina
        clearCurrentRoutine(newDiscipline)
    }

    // Manejar selección de rutina existente
    const handleRoutineSelect = (e) => {
        const routineId = e.target.value
        if (routineId === 'new') {
            clearCurrentRoutine(selectedDiscipline)
        } else {
            loadRoutineToEdit(routineId)
        }
    }

    const [notification, setNotification] = useState({
        isOpen: false,
        type: 'success',
        title: '',
        message: ''
    })

    const handleSave = async () => {
        const result = await saveRoutine()
        if (result.success) {
            setNotification({
                isOpen: true,
                type: 'success',
                title: '¡Éxito!',
                message: 'Rutina guardada correctamente'
            })
        } else {
            setNotification({
                isOpen: true,
                type: 'error',
                title: 'Error',
                message: 'Error al guardar: ' + result.error
            })
        }
    }

    const closeNotification = () => {
        setNotification(prev => ({ ...prev, isOpen: false }))
    }

    const handleDeleteClick = () => {
        if (currentRoutine.id) {
            setShowDeleteModal(true)
        }
    }

    const handleConfirmDelete = async () => {
        if (!currentRoutine.id) return

        await deleteRoutine(currentRoutine.id)
        clearCurrentRoutine(selectedDiscipline)
        setShowDeleteModal(false)
    }

    // --- Lógica de Ejercicios ---

    const handleAddExercise = () => {
        if (!selectedDay || !selectedExerciseId) return

        const exerciseToAdd = exercises.find(e => e.id === selectedExerciseId)
        if (!exerciseToAdd) return

        const routineExercise = {
            exerciseId: exerciseToAdd.id,
            nombre: exerciseToAdd.nombre,
            repeticiones: '',
            peso: '',
            tiempo: '',
            descanso: ''
        }

        const currentDayRoutine = currentRoutine.dias[selectedDay] || []
        const newRoutineList = [...currentDayRoutine, routineExercise]

        updateCurrentRoutineDay(selectedDay, newRoutineList)
        setSelectedExerciseId('')
        setSelectedDay(null)
    }


    const handleRemoveExercise = (day, index) => {
        const currentDayRoutine = currentRoutine.dias[day] || []
        const newRoutineList = currentDayRoutine.filter((_, i) => i !== index)
        updateCurrentRoutineDay(day, newRoutineList)
    }

    const filteredRoutines = savedRoutines.filter(r => r.disciplina === selectedDiscipline)

    const handleUpdateExercise = (day, index, field, value) => {
        const dayExercises = [...currentRoutine.dias[day]]
        dayExercises[index] = {
            ...dayExercises[index],
            [field]: value
        }


        updateCurrentRoutineDay(day, dayExercises)
    }


    return (
        <div className="weekly-view">
            {/* Barra de Herramientas de Rutina */}
            <div className="routine-toolbar">
                <div className="toolbar-group">
                    <label>Disciplina:</label>
                    <select
                        value={selectedDiscipline}
                        onChange={handleDisciplineChange}
                        className="toolbar-select"
                    >
                        {disciplines.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>

                <div className="toolbar-group">
                    <label>Rutina:</label>
                    <select
                        value={currentRoutine.id || 'new'}
                        onChange={handleRoutineSelect}
                        className="toolbar-select"
                    >
                        <option value="new">+ Nueva Rutina</option>
                        {filteredRoutines.map(r => (
                            <option key={r.id} value={r.id}>{r.nombre}</option>
                        ))}
                    </select>
                </div>

                <div className="toolbar-group main-input">
                    <label>Nombre:</label>
                    <input
                        type="text"
                        placeholder="Nombre de la rutina (ej. Hipertrofia A)"
                        value={currentRoutine.nombre}
                        onChange={(e) => updateCurrentRoutineMeta('nombre', e.target.value)}
                        className="routine-name-input"
                    />
                </div>

                <div className="toolbar-actions">
                    {currentRoutine.id && (
                        <button onClick={handleDeleteClick} className="danger-btn" title="Eliminar Rutina">
                            <FaTrash />
                        </button>
                    )}
                    <button onClick={handleSave} className="save-routine-btn">
                        Guardar Rutina
                    </button>
                </div>
            </div>

            {/* Grid Semanal */}
            <div className="week-grid">
                {days.map(day => (
                    <div key={day} className="day-column">
                        <div className="day-header">
                            <h3>{day.charAt(0).toUpperCase() + day.slice(1)}</h3>
                            <button
                                className="add-day-btn"
                                onClick={() => setSelectedDay(day)}
                                title="Agregar ejercicio"
                            >
                                <FaPlus size={12} />
                            </button>
                        </div>

                        <div className="day-content">
                            {(currentRoutine.dias[day] || []).map((ex, idx) => {
                                const isExpanded = expandedItem === `${day}-${idx}`

                                return (
                                    <div
                                        key={`${day}-${idx}`}
                                        className={`routine-item ${isExpanded ? 'expanded' : ''}`}
                                    >
                                        <div className="routine-item-info">
                                            <div
                                                className="routine-item-header"
                                                onClick={() => toggleExpand(day, idx)}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    {isExpanded ? <FaChevronUp size={12} color="#94a3b8" /> : <FaChevronDown size={12} color="#94a3b8" />}
                                                    <strong>{ex.nombre}</strong>
                                                </div>
                                            </div>

                                            {isExpanded && (
                                                <div className="routine-inputs">
                                                    <div className="input-group">
                                                        <input
                                                            type="text"
                                                            placeholder="Reps"
                                                            value={ex.repeticiones}
                                                            onChange={(e) =>
                                                                handleUpdateExercise(day, idx, 'repeticiones', e.target.value)
                                                            }
                                                        />
                                                        <span>reps</span>
                                                    </div>

                                                    <div className="input-group">
                                                        <input
                                                            type="text"
                                                            placeholder="Peso"
                                                            value={ex.peso}
                                                            onChange={(e) =>
                                                                handleUpdateExercise(day, idx, 'peso', e.target.value)
                                                            }
                                                        />
                                                        <span>kg</span>
                                                    </div>

                                                    <div className="input-group">
                                                        <input
                                                            type="text"
                                                            placeholder="Tiempo"
                                                            value={ex.tiempo}
                                                            onChange={(e) =>
                                                                handleUpdateExercise(day, idx, 'tiempo', e.target.value)
                                                            }
                                                        />
                                                        <span>min/seg</span>
                                                    </div>

                                                    <div className="input-group">
                                                        <input
                                                            type="text"
                                                            placeholder="Descanso"
                                                            value={ex.descanso}
                                                            onChange={(e) =>
                                                                handleUpdateExercise(day, idx, 'descanso', e.target.value)
                                                            }
                                                        />
                                                        <span>min/seg</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            className="remove-item-btn"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleRemoveExercise(day, idx)
                                            }}
                                            title="Eliminar ejercicio"
                                        >
                                            <FaTrash size={14} />
                                        </button>
                                    </div>
                                )
                            })}
                            {(currentRoutine.dias[day] || []).length === 0 && (
                                <p className="empty-day">Sin actividad</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {
                selectedDay && (
                    <div className="mini-modal-overlay" onClick={() => setSelectedDay(null)}>
                        <div className="mini-modal" onClick={e => e.stopPropagation()}>
                            <h4>Agregar a {selectedDay}</h4>
                            <select
                                value={selectedExerciseId}
                                onChange={e => setSelectedExerciseId(e.target.value)}
                                className="exercise-select"
                            >
                                <option value="">Seleccionar ejercicio...</option>
                                {exercises.map(ex => (
                                    <option key={ex.id} value={ex.id}>
                                        {ex.nombre}
                                    </option>
                                ))}
                            </select>
                            <div className="modal-actions">
                                <button onClick={() => setSelectedDay(null)} className="cancel-btn">Cancelar</button>
                                <button onClick={handleAddExercise} className="save-btn" disabled={!selectedExerciseId}>Agregar</button>
                            </div>
                        </div>
                    </div>
                )
            }

            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleConfirmDelete}
                title="Eliminar Rutina"
                message={`¿Estás seguro que deseas eliminar la rutina "${currentRoutine.nombre}"? Esta acción no se puede deshacer.`}
            />

            <NotificationModal
                isOpen={notification.isOpen}
                onClose={closeNotification}
                type={notification.type}
                title={notification.title}
                message={notification.message}
            />
        </div >
    )
}

export default WeeklyView
