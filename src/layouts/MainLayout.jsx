// En tu componente principal (por ejemplo, Dashboard.jsx o App.jsx)
import { useState, useContext, useMemo } from 'react'
import { ClientContext } from '../context/ClientContext'
import Functions from '../components/Functions/Functions'
import Table from '../components/Table/Table'
import Navbar from '../components/Navbar/Navbar'
import StatsCards from '../components/StatsCards/StatsCards'

const Dashboard = () => {
  const { clients, getEstadoSuscripcion } = useContext(ClientContext)
  const [terminoBusqueda, setTerminoBusqueda] = useState("")
  const [filtroEstado, setFiltroEstado] = useState("todos")

  // Lógica de filtrado centralizada
  const clientesFiltrados = useMemo(() => {
    let result = clients

    // 1. Filtrar por estado
    if (filtroEstado !== 'todos') {
      result = result.filter(cliente => {
        const estado = getEstadoSuscripcion(cliente.fechaFin)
        if (filtroEstado === 'activos') return estado === 'normal'
        if (filtroEstado === 'por-vencer') return estado === 'por-vencer'
        if (filtroEstado === 'vencidos') return estado === 'vencido'
        return true
      })
    }

    // 2. Filtrar por término de búsqueda
    if (terminoBusqueda && terminoBusqueda.length >= 3) {
      const terminoLower = terminoBusqueda.toLowerCase()
      result = result.filter(cliente =>
        cliente.nombre?.toLowerCase().includes(terminoLower) ||
        cliente.apellido?.toLowerCase().includes(terminoLower) ||
        cliente.dni?.includes(terminoBusqueda) ||
        cliente.disciplina?.toLowerCase().includes(terminoLower) ||
        `${cliente.nombre || ''} ${cliente.apellido || ''}`.toLowerCase().includes(terminoLower)
      )
    }

    return result
  }, [clients, terminoBusqueda, filtroEstado, getEstadoSuscripcion])

  const handleSearchUpdate = (nuevoTermino) => {
    setTerminoBusqueda(nuevoTermino)
  }

  const handleFilterChange = (nuevoFiltro) => {
    setFiltroEstado(nuevoFiltro)
  }

  return (
    <div className="dashboard">
      <Navbar />

      <div className="content">
        <StatsCards
          onFilterChange={handleFilterChange}
          selectedFilter={filtroEstado}
        />

        <Functions
          onSearchUpdate={handleSearchUpdate}
          filtroEstado={filtroEstado}
          onFilterChange={handleFilterChange}
        />

        <Table
          terminoBusqueda={terminoBusqueda}
          estaBuscando={terminoBusqueda.length >= 3 || filtroEstado !== 'todos'}
          clientesFiltrados={clientesFiltrados}
        />
      </div>
    </div>
  )
}

export default Dashboard