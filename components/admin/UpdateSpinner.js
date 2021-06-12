import { useContext } from 'react';
import Loader from 'react-loader-spinner';

import { AdminContext } from '../../lib/stores';

export default function UpdateSpinner() {
  const { isUpdating } = useContext(AdminContext);

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          position: 'fixed',
          top: '0px',
          left: '0px',
          marginTop: '5px',
          marginLeft: '5px',
        }}
      >
        {isUpdating > 0 && <Loader type='Bars' color='#000000' height={24} width={24} />}
      </div>
    </div>
  );
}
