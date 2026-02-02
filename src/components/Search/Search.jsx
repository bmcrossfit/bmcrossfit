// components/Buscador/Buscador.jsx
import { useState, useRef, useEffect } from 'react'
import './Search.css'

const Search = ({ onBuscar, onLimpiar, filtroEstado, onFilterChange }) => {
  const [termino, setTermino] = useState("")
  const inputRef = useRef(null)
  const timeoutRef = useRef(null)

  const handleChange = (e) => {
    const nuevoTermino = e.target.value
    setTermino(nuevoTermino)

    // Limpiar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Debounce de 300ms
    timeoutRef.current = setTimeout(() => {
      onBuscar(nuevoTermino.trim())
    }, 300)
  }

  const handleEstadoChange = (e) => {
    if (onFilterChange) {
      onFilterChange(e.target.value)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onBuscar(termino.trim())
    } else if (e.key === 'Escape') {
      handleLimpiar()
    }
  }

  const handleLimpiar = () => {
    setTermino("")
    onLimpiar()
    inputRef.current?.focus()
  }

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="barra-busqueda">
      <div className="buscador-container">
        <select
          className="filtro-estado"
          value={filtroEstado}
          onChange={handleEstadoChange}
        >
          <option value="todos">Todos los estados</option>
          <option value="activos">Activos</option>
          <option value="por-vencer">Por Vencer</option>
          <option value="vencidos">Vencidos</option>
        </select>

        <div className="buscador-input-wrapper">
          {/* Ícono de búsqueda con SVG */}
          <svg
            className="icono-busqueda"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <circle cx="11" cy="11" r="8" strokeWidth="2" />
            <path d="M21 21L16.65 16.65" strokeWidth="2" strokeLinecap="round" />
          </svg>

          <input
            ref={inputRef}
            type="text"
            className="buscador-input"
            placeholder="Buscar cliente..."
            value={termino}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />

          {termino && (
            <button
              className="boton-limpiar-busqueda"
              onClick={handleLimpiar}
              aria-label="Limpiar búsqueda"
              title="Limpiar búsqueda"
            >
              {/* Ícono X con SVG */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M18 6L6 18" strokeWidth="2" strokeLinecap="round" />
                <path d="M6 6L18 18" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Search