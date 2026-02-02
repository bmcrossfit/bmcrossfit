import React, { useState, useContext } from 'react'
import { ClientContext } from '../../context/ClientContext'
import './EditClient.css'

const EditClient = ({ client, onSuccess, onClose }) => {
    const { actualizarCliente } = useContext(ClientContext)

    // Función para formatear fecha para el input type="date"
    const formatDateForInput = (dateString) => {
        if (!dateString) return ''
        try {
            const date = new Date(dateString)
            if (isNaN(date.getTime())) return ''
            return date.toISOString().split('T')[0]
        } catch {
            return ''
        }
    }

    const [formData, setFormData] = useState({
        nombre: client.nombre || '',
        apellido: client.apellido || '',
        dni: client.dni || '',
        disciplina: client.disciplina || '',
        fechaInicio: formatDateForInput(client.fechaInicio),
        fechaFin: formatDateForInput(client.fechaFin)
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

        const datosActualizados = {
            nombre: formData.nombre.trim(),
            apellido: formData.apellido.trim(),
            dni: formData.dni.trim(),
            disciplina: formData.disciplina || '',
            fechaInicio: formData.fechaInicio || '',
            fechaFin: formData.fechaFin || ''
        }

        const resultado = await actualizarCliente(client.id, datosActualizados)

        if (resultado.success) {
            if (onSuccess) {
                onSuccess()
            }
            if (onClose) {
                onClose()
            }
        } else {
            alert(`Error: ${resultado.message}`)
        }

        setLoading(false)
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
                        <label htmlFor="nombre">Nombre *</label>
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
                        <label htmlFor="apellido">Apellido *</label>
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
                        <label htmlFor="dni">DNI *</label>
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
                        <label htmlFor="disciplina">Disciplina</label>
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
                        <label htmlFor="fechaInicio">Fecha de Inicio</label>
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
                        <label htmlFor="fechaFin">Fecha de Fin</label>
                        <input
                            type="date"
                            id="fechaFin"
                            name="fechaFin"
                            value={formData.fechaFin}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button
                        type="submit"
                        className="btn-submit"
                        disabled={loading}
                    >
                        {loading ? 'Guardando...' : 'Guardar Cambios'}
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
            </form>
        </div>
    )
}

export default EditClient
