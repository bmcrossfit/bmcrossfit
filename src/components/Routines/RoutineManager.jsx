import React, { useState } from 'react'
import ExerciseList from './ExerciseList'
import WeeklyView from './WeeklyView'
import './Routines.css'

const RoutineManager = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState('weekly') // weekly | exercises

    return (
        <div className="routine-manager">
            <div className="routine-header">
                <h2>Gestión de Rutinas</h2>
                <div className="routine-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'weekly' ? 'active' : ''}`}
                        onClick={() => setActiveTab('weekly')}
                    >
                        Planificación Semanal
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'exercises' ? 'active' : ''}`}
                        onClick={() => setActiveTab('exercises')}
                    >
                        Catálogo de Ejercicios
                    </button>
                </div>
                <button className="close-btn" onClick={onClose}>&times;</button>
            </div>

            <div className="routine-content">
                {activeTab === 'weekly' ? <WeeklyView /> : <ExerciseList />}
            </div>
        </div>
    )
}

export default RoutineManager
