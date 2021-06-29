import { useState, createContext } from 'react';

export const AdminContext = createContext(null);

const DEFAULT_QUEUE_AGE_DAYS = 2;

export function AdminProvider({ children }) {
  const [queue, setQueue] = useState([]);
  const [queueDays, setQueueDays] = useState(DEFAULT_QUEUE_AGE_DAYS);
  const [tagQueue, setTagQueue] = useState('#');
  const [queueSearch, setQueueSearch] = useState(null);
  const [queueFilterField, setQueueFilterField] = useState('updatedAt');
  const [isUpdating, setIsUpdating] = useState(0);

  const store = {
    queue,
    setQueue,
    queueDays,
    setQueueDays,
    tagQueue,
    setTagQueue,
    queueSearch,
    setQueueSearch,
    queueFilterField,
    setQueueFilterField,
    isUpdating,
    setIsUpdating,
  };

  return <AdminContext.Provider value={store}>{children}</AdminContext.Provider>;
}

export const HomePageContext = createContext(null);

export function HomePageProvider({ children }) {
  const [categoryFilter, setCategoryFilter] = useState(0);
  const [languageFilter, setLanguageFilter] = useState(0);
  // TODO: rename to sortChannels
  const [sortField, setSortField] = useState(0);
  const [sortTopics, setSortTopics] = useState(0);
  const [streamTags, setStreamTags] = useState([]);
  const [tagFilter, setTagFilter] = useState(null);
  const [trackedChannelCount, setTrackedChannelCount] = useState(null);

  const store = {
    categoryFilter,
    setCategoryFilter,
    languageFilter,
    setLanguageFilter,
    sortField,
    setSortField,
    sortTopics,
    setSortTopics,
    streamTags,
    setStreamTags,
    tagFilter,
    setTagFilter,
    trackedChannelCount,
    setTrackedChannelCount,
  };

  return <HomePageContext.Provider value={store}>{children}</HomePageContext.Provider>;
}
