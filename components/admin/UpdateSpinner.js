import { useContext } from 'react';
import Loader from 'react-loader-spinner';

import { AdminContext } from '../../lib/stores';

export default function UpdateSpinner() {
  const { isUpdating } = useContext(AdminContext);

  return (
    <div className='relative'>
      <div className='fixed top-0 left-0 mt-1 ml-2'>
        {isUpdating > 0 && <Loader type='Bars' color='#000000' height={24} width={24} />}
      </div>
    </div>
  );
}
