import { useState, useContext } from 'react';
import { useToasts } from 'react-toast-notifications';
import { useForm } from 'react-hook-form';

import Section from '../Layout/Section';

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
    <Section className='p-2 pb-4'>
      <h2 className='text-xl font-header'>Add Channel</h2>

      <form className='mx-2 mt-2' onSubmit={handleSubmit(onSubmit)}>
        <input
          type='text'
          className='h-8 w-48 mt-1 p-2 bg-gray-100 border border-gray-200 mr-2 rounded-md shadow-sm'
          {...register('channelName', { required: true })}
        />

        <input type='submit' className='border border-black px-2' />
      </form>
    </Section>
  );
}
