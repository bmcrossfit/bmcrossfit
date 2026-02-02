import { useContext, useEffect } from "react"
import { ClientContext } from "../context/ClientContext"

const Clients = () => {
  const { clients, getClients, loading } = useContext(ClientContext)

  useEffect(() => {
    getClients()
  }, [])

  if (loading) return <p>Cargando...</p>

  return (
    <ul>
      {clients.map(client => (
        <li key={client.id}>{client.name}</li>
      ))}
    </ul>
  )
}

export default Clients
