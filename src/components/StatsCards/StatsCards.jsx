import React, { useContext, useMemo } from 'react'
import { ClientContext } from '../../context/ClientContext'
import './StatsCards.css'
import { FaUsers, FaUserCheck, FaUserClock, FaUserTimes } from 'react-icons/fa'

const StatsCards = ({ onFilterChange, selectedFilter }) => {
    const { clients, getEstadoSuscripcion } = useContext(ClientContext)

    const stats = useMemo(() => {
        const initialStats = {
            total: 0,
            activos: 0,
            porVencer: 0,
            vencidos: 0
        }

        return clients.reduce((acc, client) => {
            acc.total++
            const estado = getEstadoSuscripcion(client.fechaFin)

            if (estado === 'normal') acc.activos++
            else if (estado === 'por-vencer') acc.porVencer++
            else if (estado === 'vencido') acc.vencidos++

            return acc
        }, initialStats)
    }, [clients, getEstadoSuscripcion])

    return (
        <div className="stats-container">
            <div
                className={`stat-card total ${selectedFilter === 'todos' ? 'selected' : ''}`}
                onClick={() => onFilterChange('todos')}
                style={{ cursor: 'pointer', border: selectedFilter === 'todos' ? '1px solid #fff' : '1px solid transparent' }}
            >
                <div className="stat-icon">
                    <FaUsers />
                </div>
                <div className="stat-info">
                    <h3>Total Clientes</h3>
                    <p className="stat-value">{stats.total}</p>
                </div>
            </div>

            <div
                className={`stat-card active ${selectedFilter === 'activos' ? 'selected' : ''}`}
                onClick={() => onFilterChange('activos')}
                style={{ cursor: 'pointer', border: selectedFilter === 'activos' ? '1px solid #fff' : '2px solid transparent' }}
            >
                <div className="stat-icon">
                    <FaUserCheck />
                </div>
                <div className="stat-info">
                    <h3>Activos</h3>
                    <p className="stat-value">{stats.activos}</p>
                </div>
            </div>

            <div
                className={`stat-card warning ${selectedFilter === 'por-vencer' ? 'selected' : ''}`}
                onClick={() => onFilterChange('por-vencer')}
                style={{ cursor: 'pointer', border: selectedFilter === 'por-vencer' ? '1px solid #fff' : '2px solid transparent' }}
            >
                <div className="stat-icon">
                    <FaUserClock />
                </div>
                <div className="stat-info">
                    <h3>Por Vencer</h3>
                    <p className="stat-value">{stats.porVencer}</p>
                </div>
            </div>

            <div
                className={`stat-card expired ${selectedFilter === 'vencidos' ? 'selected' : ''}`}
                onClick={() => onFilterChange('vencidos')}
                style={{ cursor: 'pointer', border: selectedFilter === 'vencidos' ? '1px solid #fff' : '2px solid transparent' }}
            >
                <div className="stat-icon">
                    <FaUserTimes />
                </div>
                <div className="stat-info">
                    <h3>Vencidos</h3>
                    <p className="stat-value">{stats.vencidos}</p>
                </div>
            </div>
        </div>
    )
}

export default StatsCards
