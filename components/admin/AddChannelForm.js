import { useState, useContext } from 'react';
import { useToasts } from 'react-toast-notifications';
import { useForm } from 'react-hook-form';

import { AdminContext } from '../../lib/stores';
import { showToast } from '../../lib/util';

export default function AddChannelForm() {
  const { setIsUpdating } = useContext(AdminContext);
  const { addToast } = useToasts();
  const { register, handleSubmit, reset } = useForm();

  function onSubmit({ channelName }) {
    setIsUpdating((state) => state + 1);

    fetch('/api/addChannel', {
      method: 'POST',
      body: JSON.stringify({ channelName }),
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => res.json())
      .then(({ message, error }) => {
        showToast({ addToast, message, error });
      })
      .catch((error) => showToast({ addToast, error: error.message }))
      .finally(() => {
        setIsUpdating((state) => state - 1);
        reset({});
      });
  }

  return (
    <div>
      <h2 className='text-2xl pt-2'>Add Channel</h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        <input type='text' {...register('channelName', { required: true })} />

        <input type='submit' />
      </form>
    </div>
  );
}
