import React, { useState, useContext } from 'react'
import { RoutineContext } from '../../context/RoutineContext'
import ConfirmationModal from './ConfirmationModal'
import { FaTrash, FaPlus } from 'react-icons/fa'
import './Routines.css'

const ExerciseList = () => {
    const { exercises, addExercise, deleteExercise } = useContext(RoutineContext)
    const [newExercise, setNewExercise] = useState({
        nombre: '',
        repeticiones: '',
        peso: '',
        tiempo: '',
        descanso: ''
    })
    const [exerciseToDelete, setExerciseToDelete] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!newExercise.nombre.trim()) return

        await addExercise(newExercise)
        setNewExercise({ nombre: '', repeticiones: '', peso: '', tiempo: '', descanso: '' })
    }

    const handleDeleteClick = (exercise) => {
        setExerciseToDelete(exercise)
    }

    const handleConfirmDelete = async () => {
        if (!exerciseToDelete) return

        await deleteExercise(exerciseToDelete.id)
        setExerciseToDelete(null)
    }

    return (
        <div className="exercise-list-container">
            <h3 style={{ color: '#fff' }}>Catálogo de Ejercicios</h3>

            <form onSubmit={handleSubmit} className="add-exercise-form">
                <input
                    type="text"
                    placeholder="Nombre del ejercicio (ej. Sentadillas)"
                    value={newExercise.nombre}
                    onChange={(e) => setNewExercise({ ...newExercise, nombre: e.target.value })}
                    required
                    className="exercise-input"
                />
                <button type="submit" className="add-btn">
                    <FaPlus /> Agregar
                </button>
            </form>

            <div className="exercises-grid">
                {exercises.length === 0 ? (
                    <p className="no-data">No hay ejercicios registrados.</p>
                ) : (
                    exercises.map(ex => (
                        <div key={ex.id} className="exercise-card">
                            <div className="exercise-info">
                                <h4>{ex.nombre}</h4>
                                <div className="exercise-details">
                                    {ex.repeticiones && <span>Reps: {ex.repeticiones}</span>}
                                    {ex.peso && <span>Peso: {ex.peso} Kg</span>}
                                    {ex.tiempo && <span>Tiempo: {ex.tiempo} seg/min</span>}
                                    {ex.descanso && <span>Descanso: {ex.descanso} seg/min</span>}
                                    {/* Retrocompatibilidad */}
                                    {ex.pesoTiempo && !ex.peso && !ex.tiempo && <span>Otros: {ex.pesoTiempo}</span>}
                                </div>
                            </div>
                            <button
                                onClick={() => handleDeleteClick(ex)}
                                className="delete-btn"
                                title="Eliminar ejercicio"
                            >
                                <FaTrash />
                            </button>
                        </div>
                    ))
                )}
            </div>

            <ConfirmationModal
                isOpen={!!exerciseToDelete}
                onClose={() => setExerciseToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Eliminar Ejercicio"
                message={`¿Estás seguro que deseas eliminar el ejercicio "${exerciseToDelete?.nombre}"?`}
            />
        </div>
    )
}

export default ExerciseList
