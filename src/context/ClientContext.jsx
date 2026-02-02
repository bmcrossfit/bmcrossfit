import { createContext, useState } from "react"
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp
} from "firebase/firestore"
import { db } from "../services/DataBase/database"

export const ClientContext = createContext()

export const ClientProvider = ({ children }) => {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Obtener todos los clientes
  const getClients = async () => {
    try {
      setLoading(true)
      setError(null)
      const ref = collection(db, "usuarios")
      const snapshot = await getDocs(ref)

      const data = snapshot.docs.map(doc => {
        const docData = doc.data()
        return {
          id: doc.id,
          ...docData,
          // Convertir Timestamps de Firebase a string ISO
          fechaInicio: docData.fechaInicio ?
            docData.fechaInicio.toDate().toISOString().split('T')[0] : '',
          fechaFin: docData.fechaFin ?
            docData.fechaFin.toDate().toISOString().split('T')[0] : ''
        }
      })

      setClients(data)
      return { success: true, data }
    } catch (error) {
      console.error("Error al traer clientes:", error)
      setError("Error al cargar los clientes")
      return { success: false, message: "Error al cargar los clientes" }
    } finally {
      setLoading(false)
    }
  }

  // Agregar nuevo cliente
  const agregarCliente = async (nuevoCliente) => {
    try {
      setLoading(true)
      setError(null)

      // Validar campos obligatorios
      if (!nuevoCliente.nombre || !nuevoCliente.apellido || !nuevoCliente.dni) {
        throw new Error("Nombre, apellido y DNI son obligatorios")
      }

      // Si no hay fecha de inicio, usar hoy
      const fechaInicio = nuevoCliente.fechaInicio
        ? new Date(nuevoCliente.fechaInicio)
        : new Date()

      // Si no hay fecha de fin, calcular 30 días después de la fecha de inicio
      let fechaFin = nuevoCliente.fechaFin
        ? new Date(nuevoCliente.fechaFin)
        : new Date(fechaInicio)

      if (!nuevoCliente.fechaFin) {
        fechaFin.setDate(fechaFin.getDate() + 30)
      }

      // Formatear fechas para Firebase
      const clienteFormateado = {
        nombre: nuevoCliente.nombre.trim(),
        apellido: nuevoCliente.apellido.trim(),
        dni: nuevoCliente.dni.trim(),
        disciplina: nuevoCliente.disciplina || '',
        // Convertir fechas a Timestamp de Firebase
        fechaInicio: Timestamp.fromDate(fechaInicio),
        fechaFin: Timestamp.fromDate(fechaFin),
        // Agregar fecha de creación
        fechaCreacion: Timestamp.now(),
        // Agregar estado activo por defecto
        activo: true
      }

      // Agregar a Firebase
      const docRef = await addDoc(collection(db, "usuarios"), clienteFormateado)

      // Crear cliente con ID para estado local (con fechas como string)
      const clienteConId = {
        id: docRef.id,
        nombre: nuevoCliente.nombre.trim(),
        apellido: nuevoCliente.apellido.trim(),
        dni: nuevoCliente.dni.trim(),
        disciplina: nuevoCliente.disciplina || '',
        fechaInicio: fechaInicio.toISOString().split('T')[0],
        fechaFin: fechaFin.toISOString().split('T')[0],
        fechaCreacion: new Date().toISOString().split('T')[0],
        activo: true
      }

      // Actualizar estado local
      setClients(prev => [...prev, clienteConId])

      return {
        success: true,
        message: "Cliente agregado exitosamente",
        id: docRef.id,
        cliente: clienteConId
      }
    } catch (error) {
      console.error("Error al agregar cliente:", error)
      setError(error.message || "Error al agregar el cliente")

      return {
        success: false,
        message: error.message || "Error al agregar el cliente"
      }
    } finally {
      setLoading(false)
    }
  }

  // Actualizar cliente existente
  const actualizarCliente = async (id, datosActualizados) => {
    try {
      setLoading(true)
      setError(null)

      // Validar que el ID exista
      if (!id) {
        throw new Error("ID de cliente no válido")
      }

      // Referencia al documento
      const clienteRef = doc(db, "usuarios", id)

      // Preparar datos para Firebase
      const datosParaFirebase = { ...datosActualizados }

      // Convertir fechas a Timestamp si existen
      if (datosParaFirebase.fechaInicio && typeof datosParaFirebase.fechaInicio === 'string') {
        datosParaFirebase.fechaInicio = Timestamp.fromDate(new Date(datosParaFirebase.fechaInicio))
      }

      if (datosParaFirebase.fechaFin && typeof datosParaFirebase.fechaFin === 'string') {
        datosParaFirebase.fechaFin = Timestamp.fromDate(new Date(datosParaFirebase.fechaFin))
      }

      // Agregar fecha de última actualización
      datosParaFirebase.fechaActualizacion = Timestamp.now()

      // Actualizar en Firebase
      await updateDoc(clienteRef, datosParaFirebase)

      // Actualizar estado local
      setClients(prev => prev.map(cliente =>
        cliente.id === id
          ? {
            ...cliente,
            ...datosActualizados,
            id: cliente.id
          }
          : cliente
      ))

      return {
        success: true,
        message: "Cliente actualizado correctamente",
        clienteActualizado: datosActualizados
      }
    } catch (error) {
      console.error("Error al actualizar cliente:", error)
      setError(error.message || "Error al actualizar el cliente")

      return {
        success: false,
        message: error.message || "Error al actualizar el cliente"
      }
    } finally {
      setLoading(false)
    }
  }

  // Eliminar cliente
  const eliminarCliente = async (id) => {
    try {
      setLoading(true)
      setError(null)

      if (!id) {
        throw new Error("ID de cliente no válido")
      }

      const clienteRef = doc(db, "usuarios", id)
      await deleteDoc(clienteRef)

      setClients(prev => prev.filter(cliente => cliente.id !== id))

      return {
        success: true,
        message: "Cliente eliminado correctamente"
      }
    } catch (error) {
      console.error("Error al eliminar cliente:", error)
      setError(error.message || "Error al eliminar el cliente")

      return {
        success: false,
        message: error.message || "Error al eliminar el cliente"
      }
    } finally {
      setLoading(false)
    }
  }

  // Función para buscar cliente por ID
  const getClienteById = (id) => {
    return clients.find(cliente => cliente.id === id)
  }

  // Función para buscar clientes por nombre, apellido o DNI
  const buscarClientes = (termino) => {
    if (!termino) return clients

    const terminoLower = termino.toLowerCase()
    return clients.filter(cliente =>
      cliente.nombre?.toLowerCase().includes(terminoLower) ||
      cliente.apellido?.toLowerCase().includes(terminoLower) ||
      cliente.dni?.includes(termino)
    )
  }

  // Función para extender suscripción (CORREGIDA)
  const extenderSuscripcion = async (id, meses = 1) => {
    try {
      setLoading(true)
      setError(null)

      const cliente = getClienteById(id)
      if (!cliente) {
        throw new Error("Cliente no encontrado")
      }

      // Obtener la fecha actual (hoy)
      const hoy = new Date()
      const hoyString = hoy.toISOString().split('T')[0]

      // Calcular nueva fecha de fin: hoy + (meses * 30 días)
      const nuevaFechaFin = new Date(hoy)
      nuevaFechaFin.setDate(hoy.getDate() + (meses * 30))
      const nuevaFechaFinString = nuevaFechaFin.toISOString().split('T')[0]

      // Preparar datos para actualizar
      const datosActualizados = {
        fechaInicio: hoyString,
        fechaFin: nuevaFechaFinString
      }

      // Referencia al documento
      const clienteRef = doc(db, "usuarios", id)

      // Actualizar en Firebase con Timestamps
      await updateDoc(clienteRef, {
        fechaInicio: Timestamp.fromDate(hoy),
        fechaFin: Timestamp.fromDate(nuevaFechaFin),
        fechaActualizacion: Timestamp.now()
      })

      // Actualizar estado local
      setClients(prev => prev.map(cliente =>
        cliente.id === id
          ? {
            ...cliente,
            fechaInicio: hoyString,
            fechaFin: nuevaFechaFinString
          }
          : cliente
      ))

      return {
        success: true,
        message: `Suscripción extendida ${meses} mes(es) correctamente`,
        nuevaFechaInicio: hoyString,
        nuevaFechaFin: nuevaFechaFinString
      }
    } catch (error) {
      console.error("Error al extender suscripción:", error)
      setError(error.message || "Error al extender la suscripción")

      return {
        success: false,
        message: error.message || "Error al extender la suscripción"
      }
    } finally {
      setLoading(false)
    }
  }

  // Función alternativa para extender desde la última fecha
  const extenderDesdeUltimaFecha = async (id, meses = 1) => {
    try {
      setLoading(true)
      setError(null)

      const cliente = getClienteById(id)
      if (!cliente) {
        throw new Error("Cliente no encontrado")
      }

      // Usar la fecha de fin actual o hoy si no existe
      const fechaBase = cliente.fechaFin
        ? new Date(cliente.fechaFin)
        : new Date()

      // Calcular nueva fecha de fin: fecha base + (meses * 30 días)
      const nuevaFechaFin = new Date(fechaBase)
      nuevaFechaFin.setDate(fechaBase.getDate() + (meses * 30))
      const nuevaFechaFinString = nuevaFechaFin.toISOString().split('T')[0]

      // Preparar datos para actualizar (solo fechaFin)
      const datosActualizados = {
        fechaFin: nuevaFechaFinString
      }

      // Referencia al documento
      const clienteRef = doc(db, "usuarios", id)

      // Actualizar en Firebase
      await updateDoc(clienteRef, {
        fechaFin: Timestamp.fromDate(nuevaFechaFin),
        fechaActualizacion: Timestamp.now()
      })

      // Actualizar estado local
      setClients(prev => prev.map(cliente =>
        cliente.id === id
          ? {
            ...cliente,
            fechaFin: nuevaFechaFinString
          }
          : cliente
      ))

      return {
        success: true,
        message: `Suscripción extendida ${meses} mes(es) desde la última fecha`,
        nuevaFechaFin: nuevaFechaFinString
      }
    } catch (error) {
      console.error("Error al extender suscripción:", error)
      setError(error.message || "Error al extender la suscripción")

      return {
        success: false,
        message: error.message || "Error al extender la suscripción"
      }
    } finally {
      setLoading(false)
    }
  }

  // Función simple para checkear estado (sin async)
  const getEstadoSuscripcion = (fechaFinString) => {
    if (!fechaFinString) return 'normal'

    // Crear fechas asegurando que sean objetos Date válidos
    const hoy = new Date()
    // Normalizar hoy al inicio del día para comparaciones más precisas
    hoy.setHours(0, 0, 0, 0)

    const fechaFin = new Date(fechaFinString)
    // Normalizar fecha fin (asumiendo que viene como YYYY-MM-DD, esto le da hora 00:00 UTC, 
    // pero al convertir a local puede variar. Mejor tratar como string fecha puro o ajustar zona horaria
    // Para simplificar, comparamos timestamps de días

    if (isNaN(fechaFin.getTime())) return 'normal'

    // Ajustar fecha fin para que sea inclusiva (fin del día) o inicio
    // Para simplificar: calculamos diferencia en días
    const diffTime = fechaFin - hoy
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return 'vencido'
    if (diffDays <= 5) return 'por-vencer'
    return 'normal'
  }

  return (
    <ClientContext.Provider
      value={{
        // Estado
        clients,
        loading,
        error,

        // Funciones CRUD
        getClients,
        agregarCliente,
        actualizarCliente,
        eliminarCliente,

        // Funciones adicionales
        getClienteById,
        buscarClientes,
        extenderSuscripcion,
        extenderDesdeUltimaFecha,
        getEstadoSuscripcion
      }}
    >
      {children}
    </ClientContext.Provider>
  )
}

export default ClientProvider