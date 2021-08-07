import LoadingAnimation from 'react-loader-spinner';

export default function Loader({ message, theme }) {
  return (
    <div className='flex flex-col place-items-center'>
      <div className='pb-2'>Finding potential live coding channels...</div>
      <LoadingAnimation
        type='Bars'
        color={theme === 'dark' ? '#ffffff' : '#000000'}
        height={24}
        width={24}
      />
    </div>
  );
}
