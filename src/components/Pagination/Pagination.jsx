import React, { useContext } from 'react'
import { ClientContext } from '../../context/ClientContext'
import './Pagination.css'

const Pagination = () => {
  const { 
    currentPage, 
    totalPages, 
    totalClients,
    pageSize,
    getShowingRange,
    goToPage, 
    nextPage, 
    prevPage,
    goToFirstPage,
    goToLastPage,
    loading 
  } = useContext(ClientContext)

  if (totalPages <= 1) return null

  const { start, end } = getShowingRange()

  // Generar números de página a mostrar
  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5 // Máximo de números de página visibles
    
    if (totalPages <= maxVisible) {
      // Mostrar todas las páginas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Mostrar páginas alrededor de la actual
      let startPage = Math.max(1, currentPage - 2)
      let endPage = Math.min(totalPages, currentPage + 2)
      
      if (currentPage <= 3) {
        endPage = maxVisible
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - maxVisible + 1
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }
    }
    
    return pages
  }

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        Mostrando {start}-{end} de {totalClients} clientes
      </div>
      
      <div className="pagination-controls">
        <button 
          className="pagination-btn first-page"
          onClick={goToFirstPage}
          disabled={currentPage === 1 || loading}
          title="Primera página"
        >
          ««
        </button>
        
        <button 
          className="pagination-btn prev-page"
          onClick={prevPage}
          disabled={currentPage === 1 || loading}
          title="Página anterior"
        >
          «
        </button>
        
        {getPageNumbers().map(page => (
          <button
            key={page}
            className={`pagination-btn page-number ${currentPage === page ? 'active' : ''}`}
            onClick={() => goToPage(page)}
            disabled={loading}
          >
            {page}
          </button>
        ))}
        
        {totalPages > 5 && currentPage < totalPages - 2 && (
          <span className="page-dots">...</span>
        )}
        
        <button 
          className="pagination-btn next-page"
          onClick={nextPage}
          disabled={currentPage === totalPages || loading}
          title="Página siguiente"
        >
          »
        </button>
        
        <button 
          className="pagination-btn last-page"
          onClick={goToLastPage}
          disabled={currentPage === totalPages || loading}
          title="Última página"
        >
          »»
        </button>
      </div>
      
      <div className="pagination-page-info">
        Página {currentPage} de {totalPages}
      </div>
    </div>
  )
}

export default Pagination