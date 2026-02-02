import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'

export const getData = async () => {
  const ref = collection(db, 'usuarios')
  const snapshot = await getDocs(ref)

  return snapshot.docs.map(doc => ({
    id: doc.id,       
    ...doc.data()
  }))
}
