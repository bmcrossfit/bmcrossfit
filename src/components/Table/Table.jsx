import './Table.css'
import Tr from '../Tr/Tr'
import Th from '../Th/Th'
import Td from '../Td/Td'
import Buttons from '../Buttons/Buttons'
import { useContext, useEffect, useMemo, useState } from "react"
import { ClientContext } from "../../context/ClientContext"

const Table = ({
  terminoBusqueda,
  estaBuscando,
  clientesFiltrados
}) => {
  const { clients, getClients, getEstadoSuscripcion, loading } = useContext(ClientContext)
  const [paginaActual, setPaginaActual] = useState(1)
  const [clientesPorPagina, setClientesPorPagina] = useState(10)

  useEffect(() => {
    getClients()
  }, [])

  // Resetear página al buscar
  useEffect(() => {
    setPaginaActual(1)
  }, [terminoBusqueda, estaBuscando])

  // Obtener los clientes a mostrar
  const clientesAMostrar = useMemo(() => {
    return estaBuscando ? clientesFiltrados : clients
  }, [clients, estaBuscando, clientesFiltrados])

  // Resto de las funciones...
  const formatearFecha = (fechaString) => {
    if (!fechaString) return ''
    try {
      const fecha = new Date(fechaString)
      if (isNaN(fecha.getTime())) return ''
      const dia = String(fecha.getDate()).padStart(2, '0')
      const mes = String(fecha.getMonth() + 1).padStart(2, '0')
      const año = fecha.getFullYear()
      return `${dia}-${mes}-${año}`
    } catch (error) {
      console.error('Error formateando fecha:', error)
      return ''
    }
  }



  const ordenarClientes = useMemo(() => {
    return [...clientesAMostrar].sort((a, b) => {
      const estadoA = getEstadoSuscripcion(a.fechaFin)
      const estadoB = getEstadoSuscripcion(b.fechaFin)
      const prioridad = { 'vencido': 0, 'por-vencer': 1, 'normal': 2 }
      if (prioridad[estadoA] !== prioridad[estadoB]) {
        return prioridad[estadoA] - prioridad[estadoB]
      }
      const fechaA = new Date(a.fechaFin)
      const fechaB = new Date(b.fechaFin)
      return fechaA - fechaB
    })
  }, [clientesAMostrar])

  // Cálculos de paginación
  const indiceUltimoCliente = paginaActual * clientesPorPagina
  const indicePrimerCliente = indiceUltimoCliente - clientesPorPagina
  const clientesActuales = ordenarClientes.slice(indicePrimerCliente, indiceUltimoCliente)
  const totalPaginas = Math.ceil(ordenarClientes.length / clientesPorPagina)

  const cambiarPagina = (numeroPagina) => {
    if (numeroPagina >= 1 && numeroPagina <= totalPaginas) {
      setPaginaActual(numeroPagina)
    }
  }

  const handleClientesPorPaginaChange = (e) => {
    setClientesPorPagina(Number(e.target.value))
    setPaginaActual(1)
  }

  const getClaseEstado = (estado) => {
    switch (estado) {
      case 'vencido': return 'fila-vencida'
      case 'por-vencer': return 'fila-por-vencer'
      default: return ''
    }
  }

  const generarNumerosPagina = () => {
    const numeros = []
    const maxPaginasVisibles = 5
    if (totalPaginas <= maxPaginasVisibles) {
      for (let i = 1; i <= totalPaginas; i++) numeros.push(i)
    } else {
      let startPage = Math.max(1, paginaActual - 2)
      let endPage = Math.min(totalPaginas, paginaActual + 2)
      if (startPage > 1) {
        numeros.push(1)
        if (startPage > 2) numeros.push('...')
      }
      for (let i = startPage; i <= endPage; i++) numeros.push(i)
      if (endPage < totalPaginas) {
        if (endPage < totalPaginas - 1) numeros.push('...')
        numeros.push(totalPaginas)
      }
    }
    return numeros
  }

  // Función para resaltar texto
  const resaltarTexto = (texto) => {
    if (!estaBuscando || !terminoBusqueda || terminoBusqueda.length < 3) {
      return texto
    }
    const textoStr = texto?.toString() || ''
    const terminoLower = terminoBusqueda.toLowerCase()
    if (!textoStr.toLowerCase().includes(terminoLower)) {
      return texto
    }
    const partes = textoStr.split(new RegExp(`(${terminoBusqueda})`, 'gi'))
    return (
      <span>
        {partes.map((parte, i) =>
          parte.toLowerCase() === terminoLower.toLowerCase() ? (
            <mark key={i} className="resaltado-busqueda">{parte}</mark>
          ) : (
            <span key={i}>{parte}</span>
          )
        )}
      </span>
    )
  }

  return (
    <div className="table-container">
      {/* Controles de paginación SUPERIOR */}
      <div className="paginacion-superior">
        <div className="controles-paginacion">
          <div className="selector-registros">
            <label htmlFor="clientesPorPagina">Mostrar: </label>
            <select
              id="clientesPorPagina"
              value={clientesPorPagina}
              onChange={handleClientesPorPaginaChange}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span>registros por página</span>
          </div>

          <div className="info-paginacion">
            <span>
              Mostrando {indicePrimerCliente + 1} - {Math.min(indiceUltimoCliente, ordenarClientes.length)} de {ordenarClientes.length} cliente{ordenarClientes.length !== 1 ? 's' : ''}
              {estaBuscando && " (filtrados)"}
            </span>
          </div>
        </div>
      </div>

      {/* VISTA ESCRITORIO (> 920px) */}
      <div className="desktop-table-view">
        <table className='table'>
          <thead>
            <Tr>
              <Th>#</Th>
              <Th>Nombre</Th>
              <Th>Apellido</Th>
              <Th>DNI</Th>
              <Th>Disciplina</Th>
              <Th>Inicio</Th>
              <Th>Fin</Th>
              <Th>Estado</Th>
              <Th>Acciones</Th>
            </Tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9">
                  <div className="loading-container">
                    <div className="spinner"></div>
                    {/* Optional: Add text if desired, hidden by CSS currently */}
                  </div>
                </td>
              </tr>
            ) : clientesActuales.length > 0 ? (
              clientesActuales.map((client, index) => {
                const indiceGlobal = indicePrimerCliente + index
                const estado = getEstadoSuscripcion(client.fechaFin)
                const claseFila = getClaseEstado(estado)

                return (
                  <Tr key={client.id} className={claseFila}>
                    <Td>{indiceGlobal + 1}</Td>
                    <Td>{resaltarTexto(client.nombre)}</Td>
                    <Td>{resaltarTexto(client.apellido)}</Td>
                    <Td>{resaltarTexto(client.dni) || 'N/A'}</Td>
                    <Td>{resaltarTexto(client.disciplina) || 'Sin especificar'}</Td>
                    <Td>{formatearFecha(client.fechaInicio)}</Td>
                    <Td>{formatearFecha(client.fechaFin)}</Td>
                    <Td>
                      <span className={`badge-estado estado-${estado}`}>
                        {estado === 'vencido' ? 'Vencido' :
                          estado === 'por-vencer' ? 'Por vencer' : 'Activo'}
                      </span>
                    </Td>
                    <Td>
                      <Buttons
                        client={client}
                        onClientUpdated={getClients}
                      />
                    </Td>
                  </Tr>
                )
              })
            ) : (
              <tr>
                <td colSpan="9" className="sin-resultados">
                  {estaBuscando && terminoBusqueda && terminoBusqueda.length >= 3
                    ? `No se encontraron resultados para "${terminoBusqueda}"`
                    : "No hay clientes registrados"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* VISTA MÓVIL/TARJETAS (< 920px) */}
      <div className="mobile-card-view">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        ) : clientesActuales.length > 0 ? (
          clientesActuales.map((client, index) => {
            const indiceGlobal = indicePrimerCliente + index
            const estado = getEstadoSuscripcion(client.fechaFin)
            const claseEstado = estado === 'vencido' ? 'card-vencida' :
              estado === 'por-vencer' ? 'card-por-vencer' : ''

            return (
              <div key={client.id} className={`client-card ${claseEstado}`}>
                <div className="card-header">
                  <div className="card-title">
                    <span className="card-index">#{indiceGlobal + 1}</span>
                    <h3>{resaltarTexto(client.nombre)} {resaltarTexto(client.apellido)}</h3>
                  </div>
                  <span className={`badge-estado estado-${estado}`}>
                    {estado === 'vencido' ? 'Vencido' :
                      estado === 'por-vencer' ? 'Por vencer' : 'Activo'}
                  </span>
                </div>

                <div className="card-body">
                  <div className="card-row">
                    <span className="card-label">DNI:</span>
                    <span className="card-value">{resaltarTexto(client.dni) || 'N/A'}</span>
                  </div>
                  <div className="card-row">
                    <span className="card-label">Disciplina:</span>
                    <span className="card-value">{resaltarTexto(client.disciplina) || 'Sin especificar'}</span>
                  </div>
                  <div className="card-row">
                    <span className="card-label">Inicio:</span>
                    <span className="card-value">{formatearFecha(client.fechaInicio)}</span>
                  </div>
                  <div className="card-row">
                    <span className="card-label">Fin:</span>
                    <span className="card-value">{formatearFecha(client.fechaFin)}</span>
                  </div>
                </div>

                <div className="card-actions">
                  <Buttons
                    client={client}
                    onClientUpdated={getClients}
                  />
                </div>
              </div>
            )
          })
        ) : (
          <div className="sin-resultados">
            {estaBuscando && terminoBusqueda && terminoBusqueda.length >= 3
              ? `No se encontraron resultados para "${terminoBusqueda}"`
              : "No hay clientes registrados"}
          </div>
        )}
      </div>

      {totalPaginas > 1 && (
        <div className="paginacion-inferior">
          <div className="controles-paginacion">
            <div className="botones-paginacion">
              <button
                className="btn-paginacion"
                onClick={() => cambiarPagina(1)}
                disabled={paginaActual === 1}
              >
                ««
              </button>
              <button
                className="btn-paginacion"
                onClick={() => cambiarPagina(paginaActual - 1)}
                disabled={paginaActual === 1}
              >
                «
              </button>

              {generarNumerosPagina().map((numero, index) => (
                <button
                  key={index}
                  className={`btn-paginacion ${numero === paginaActual ? 'activo' : ''} ${numero === '...' ? 'puntos' : ''}`}
                  onClick={() => typeof numero === 'number' && cambiarPagina(numero)}
                  disabled={numero === '...'}
                >
                  {numero}
                </button>
              ))}

              <button
                className="btn-paginacion"
                onClick={() => cambiarPagina(paginaActual + 1)}
                disabled={paginaActual === totalPaginas}
              >
                »
              </button>
              <button
                className="btn-paginacion"
                onClick={() => cambiarPagina(totalPaginas)}
                disabled={paginaActual === totalPaginas}
              >
                »»
              </button>
            </div>

            <div className="info-pagina-actual">
              <span>Página {paginaActual} de {totalPaginas}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Table