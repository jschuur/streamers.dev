import { useState, createContext } from 'react';

export const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [queue, setQueue] = useState([]);
  const [isUpdating, setIsUpdating] = useState(0);

  const store = { queue, setQueue, isUpdating, setIsUpdating };

  return <AdminContext.Provider value={store}>{children}</AdminContext.Provider>;
}
