export default function Button({ children, onClick, defaultValue, visit }) {
  return (
    <>
      <button
        type='button'
        onClick={onClick}
        defaultValue={defaultValue}
        className={`inline-flex items-center px-3 py-1 mx-1 border border-gray-300 shadow-sm text-sm font-medium rounded
          ${
            visit
              ? 'text-white bg-blue-400 hover:bg-blue-500 mr-3'
              : 'text-gray-700 bg-white hover:bg-blue-200'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
      >
        {children}
      </button>
    </>
  );
}
