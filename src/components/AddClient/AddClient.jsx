import React, { useState, useContext } from 'react'
import { ClientContext } from '../../context/ClientContext'
import './AddClient.css'

const AddClient = ({ onSuccess, onClose }) => {
    const { agregarCliente } = useContext(ClientContext)
    // Función auxiliar para obtener fecha actual (YYYY-MM-DD)
    const getTodayDate = () => {
        const today = new Date()
        const year = today.getFullYear()
        const month = String(today.getMonth() + 1).padStart(2, '0')
        const day = String(today.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        dni: '',
        disciplina: '',
        fechaInicio: getTodayDate(),
        fechaFin: ''
    })
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        // Validaciones básicas
        if (!formData.nombre || !formData.apellido || !formData.dni) {
            alert('Por favor complete: Nombre, Apellido y DNI')
            setLoading(false)
            return
        }

        // Validar DNI (solo números)
        if (!/^\d+$/.test(formData.dni)) {
            alert('El DNI debe contener solo números')
            setLoading(false)
            return
        }

        // Calcular fecha fin si solo se ingresa fecha inicio (30 días después)
        let fechaFin = formData.fechaFin
        if (formData.fechaInicio && !formData.fechaFin) {
            const fechaInicio = new Date(formData.fechaInicio)
            fechaInicio.setDate(fechaInicio.getDate() + 30)
            fechaFin = fechaInicio.toISOString().split('T')[0]
        }

        const nuevoCliente = {
            nombre: formData.nombre.trim(),
            apellido: formData.apellido.trim(),
            dni: formData.dni.trim(),
            disciplina: formData.disciplina || '',
            fechaInicio: formData.fechaInicio || '',
            fechaFin: fechaFin || ''
        }

        const resultado = await agregarCliente(nuevoCliente)

        if (resultado.success) {
            // Reset form
            setFormData({
                nombre: '',
                apellido: '',
                dni: '',
                disciplina: '',
                fechaInicio: getTodayDate(),
                fechaFin: ''
            })

            // Notificar al componente padre
            if (onSuccess) {
                onSuccess(resultado)
            }

            // Cerrar modal automáticamente después de éxito
            if (onClose) {
                onClose()
            }
        } else {
            alert(`Error: ${resultado.message}`)
        }

        setLoading(false)
    }

    const handleReset = () => {
        setFormData({
            nombre: '',
            apellido: '',
            dni: '',
            disciplina: '',
            fechaInicio: getTodayDate(),
            fechaFin: ''
        })
    }

    const handleCancel = () => {
        if (onClose) {
            onClose()
        }
    }

    return (
        <div className="form-container">
            <form onSubmit={handleSubmit} className="cliente-form">
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="nombre">Nombre <span style={{ color: '#ff0000' }}>*</span></label>
                        <input
                            type="text"
                            id="nombre"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                            placeholder="Ingrese nombre"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="apellido">Apellido <span style={{ color: '#ff0000' }}>*</span></label>
                        <input
                            type="text"
                            id="apellido"
                            name="apellido"
                            value={formData.apellido}
                            onChange={handleChange}
                            required
                            placeholder="Ingrese apellido"
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="dni">DNI <span style={{ color: '#ff0000' }}>*</span></label>
                        <input
                            type="text"
                            id="dni"
                            name="dni"
                            value={formData.dni}
                            onChange={handleChange}
                            required
                            placeholder="Ingrese DNI"
                            pattern="\d*"
                            title="Solo se permiten números"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="disciplina">Disciplina <span style={{ color: '#ff0000' }}>*</span></label>
                        <select
                            id="disciplina"
                            name="disciplina"
                            value={formData.disciplina}
                            onChange={handleChange}
                            disabled={loading}
                        >
                            <option value="">Seleccione disciplina</option>
                            <option value="Musculación">Musculación</option>
                            <option value="Crossfit">Crossfit</option>
                            <option value="Funcional">Funcional</option>
                        </select>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="fechaInicio">Fecha de Inicio <span style={{ color: '#ff0000' }}>*</span></label>
                        <input
                            type="date"
                            id="fechaInicio"
                            name="fechaInicio"
                            value={formData.fechaInicio}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="fechaFin">Fecha de Fin (opcional)</label>
                        <input
                            type="date"
                            id="fechaFin"
                            name="fechaFin"
                            value={formData.fechaFin}
                            onChange={handleChange}
                            disabled={loading}
                            placeholder="Se calculará automáticamente"
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button
                        type="submit"
                        className="btn-submit"
                        disabled={loading}
                    >
                        {loading ? 'Agregando...' : 'Agregar Cliente'}
                    </button>
                    <button
                        type="button"
                        className="btn-reset"
                        onClick={handleReset}
                        disabled={loading}
                    >
                        Limpiar
                    </button>
                    <button
                        type="button"
                        className="btn-cancel"
                        onClick={handleCancel}
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                </div>

                <div className="form-info">
                    <p><small>* Campos obligatorios</small></p>
                    <p><small>La fecha de fin se calculará automáticamente 30 días después de la fecha de inicio si no se especifica.</small></p>
                </div>
            </form>
        </div>
    )
}

export default AddClient