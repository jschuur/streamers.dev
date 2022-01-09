import { useState, useEffect } from 'react';

export default function useRefDimensions(ref) {
  const [width, setWidth] = useState();
  const [height, setHeight] = useState();

  const handleResize = () => {
    setWidth(ref.current.offsetWidth);
    setHeight(ref.current.offsetHeight);
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);

    // Set the initial size after first render
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { width, height };
}
