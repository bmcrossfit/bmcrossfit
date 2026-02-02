import { createContext, useState, useEffect } from "react"
import {
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    doc,
    setDoc,
    onSnapshot,
    query,
    orderBy
} from "firebase/firestore"
import { db } from "../services/DataBase/database"

export const RoutineContext = createContext()

export const RoutineProvider = ({ children }) => {
    const [exercises, setExercises] = useState([])

    // Rutinas guardadas (lista para selectores)
    const [savedRoutines, setSavedRoutines] = useState([])

    // Rutina actual en edición (en memoria)
    const [currentRoutine, setCurrentRoutine] = useState({
        id: null,
        nombre: '',
        disciplina: 'Funcional', // Default
        dias: {
            lunes: [],
            martes: [],
            miercoles: [],
            jueves: [],
            viernes: []
        }
    })

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Cargar ejercicios al inicio
    useEffect(() => {
        const q = query(collection(db, "ejercicios"), orderBy("nombre"))
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            setExercises(data)
        }, (err) => {
            console.error("Error al escuchar ejercicios:", err)
            setError("Error al cargar ejercicios")
        })

        return () => unsubscribe()
    }, [])

    // Cargar todas las rutinas guardadas
    useEffect(() => {
        const q = query(collection(db, "rutinas"), orderBy("nombre"))
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            setSavedRoutines(data)
        }, (err) => {
            console.error("Error al escuchar rutinas:", err)
        })

        return () => unsubscribe()
    }, [])

    // --- Gestión de Ejercicios (Catálogo) ---
    const addExercise = async (exerciseData) => {
        try {
            setLoading(true)
            await addDoc(collection(db, "ejercicios"), {
                ...exerciseData,
                fechaCreacion: new Date()
            })
            return { success: true }
        } catch (error) {
            console.error("Error agregando ejercicio:", error)
            return { success: false, error }
        } finally {
            setLoading(false)
        }
    }

    const deleteExercise = async (id) => {
        try {
            setLoading(true)
            await deleteDoc(doc(db, "ejercicios", id))
            return { success: true }
        } catch (error) {
            console.error("Error eliminando ejercicio:", error)
            return { success: false, error }
        } finally {
            setLoading(false)
        }
    }

    // --- Gestión de Rutina Actual (En memoria) ---

    // Actualizar un día específico de la routine actual
    const updateCurrentRoutineDay = (day, exercisesList) => {
        setCurrentRoutine(prevState => ({
            ...prevState,
            dias: {
                ...prevState.dias,
                [day]: exercisesList
            }
        }))
    }

    // Cambiar metadatos (nombre, disciplina)
    const updateCurrentRoutineMeta = (field, value) => {
        setCurrentRoutine(prevState => ({
            ...prevState,
            [field]: value
        }))
    }

    // Cargar una rutina guardada para editar
    const loadRoutineToEdit = (routineId) => {
        const routineToLoad = savedRoutines.find(r => r.id === routineId)
        if (routineToLoad) {
            setCurrentRoutine(routineToLoad)
        }
    }

    // Limpiar rutina actual (Nueva Rutina)
    const clearCurrentRoutine = (disciplina = 'Funcional') => {
        setCurrentRoutine({
            id: null,
            nombre: '',
            disciplina: disciplina,
            dias: {
                lunes: [],
                martes: [],
                miercoles: [],
                jueves: [],
                viernes: []
            }
        })
    }

    // --- Persistencia de Rutinas ---

    // Guardar (Crear o Actualizar) rutina completa
    const saveRoutine = async () => {
        if (!currentRoutine.nombre.trim()) return { success: false, error: "Nombre requerido" }

        try {
            setLoading(true)
            const routineData = {
                nombre: currentRoutine.nombre,
                disciplina: currentRoutine.disciplina,
                dias: currentRoutine.dias,
                ultimaActualizacion: new Date()
            }

            if (currentRoutine.id) {
                // Actualizar existente
                await setDoc(doc(db, "rutinas", currentRoutine.id), routineData)
            } else {
                // Crear nueva
                const docRef = await addDoc(collection(db, "rutinas"), {
                    ...routineData,
                    fechaCreacion: new Date()
                })
                // Actualizar ID en local
                setCurrentRoutine(prev => ({ ...prev, id: docRef.id }))
            }
            return { success: true }
        } catch (error) {
            console.error("Error guardando rutina:", error)
            return { success: false, error }
        } finally {
            setLoading(false)
        }
    }

    const deleteRoutine = async (id) => {
        try {
            setLoading(true)
            await deleteDoc(doc(db, "rutinas", id))
            // Si la borrada era la actual, limpiar
            if (currentRoutine.id === id) {
                clearCurrentRoutine(currentRoutine.disciplina)
            }
            return { success: true }
        } catch (error) {
            console.error("Error eliminando rutina:", error)
            return { success: false, error }
        } finally {
            setLoading(false)
        }
    }

    return (
        <RoutineContext.Provider
            value={{
                exercises,
                savedRoutines,
                currentRoutine,
                loading,
                error,
                addExercise,
                deleteExercise,
                updateCurrentRoutineDay,
                updateCurrentRoutineMeta,
                loadRoutineToEdit,
                clearCurrentRoutine,
                saveRoutine,
                deleteRoutine
            }}
        >
            {children}
        </RoutineContext.Provider>
    )
}
