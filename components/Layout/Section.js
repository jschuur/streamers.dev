export default function Section({ children, className, id }) {
  return (
    <div
      id={id}
      className={`my-4 shadow-md sm:rounded-lg bg-white dark:bg-gray-600 overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}

export const SectionHeader = ({ children, id }) => (
  <div className='group'>
    <h2 id={id} className='font-header text-lg sm:text-xl px-2 sm:px-3 sm:py-2'>
      {children}
      <a
        className='hidden group-hover:inline text-gray-300 hover:text-gray-300 visited:text-gray-300'
        href={`#${id}`}
      >
        {' '}
        #
      </a>
    </h2>
  </div>
);

export const SectionBlock = ({ children }) => (
  <div className='px-2 sm:px-3 py-1 sm:py-2'>{children}</div>
);

export const SectionText = ({ children }) => (
  <div className='px-2 sm:px-3 py-1 sm:py-2 text-sm sm:text-base'>{children}</div>
);