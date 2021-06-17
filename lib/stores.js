import { useState, createContext } from 'react';

export const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [queue, setQueue] = useState([]);
  const [isUpdating, setIsUpdating] = useState(0);

  const store = { queue, setQueue, isUpdating, setIsUpdating };

  return <AdminContext.Provider value={store}>{children}</AdminContext.Provider>;
}

export const HomePageContext = createContext(null);

export function HomePageProvider({ children }) {
  const [categoryFilter, setCategoryFilter] = useState(0);
  const [languageFilter, setLanguageFilter] = useState(0);
  const [sortField, setSortField] = useState(0);
  const [trackedChannelCount, setTrackedChannelCount] = useState(null);

  const store = {
    categoryFilter,
    setCategoryFilter,
    languageFilter,
    setLanguageFilter,
    sortField,
    setSortField,
    trackedChannelCount,
    setTrackedChannelCount,
  };

  return <HomePageContext.Provider value={store}>{children}</HomePageContext.Provider>;
}
