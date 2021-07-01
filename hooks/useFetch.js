import { useEffect, useContext } from 'react';
import { useToasts } from 'react-toast-notifications';

import { AdminContext } from '../lib/stores';
import { showToast } from '../lib/util';

export default function useFetch({ url, admin, setter, dependencies = [] }) {
  const { addToast } = useToasts();
  const { setIsUpdating } = useContext(AdminContext);

  useEffect(() => {
    setIsUpdating((state) => state + 1);

    const doFetch = async () => {
      const response = await fetch(url);
      const data = await response.json();

      if (data.error && admin) showToast({ addToast, error });
      else setter(data);

      setIsUpdating((state) => state - 1);
    };

    doFetch();
  }, dependencies);
}
