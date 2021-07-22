export default function DropDown({ onChange, children, label }) {
  return (
    <div>
      <label htmlFor={label} className='block text-sm font-medium text-gray-700'>
        {label}
      </label>
      <select
        className='mt-1 h-8 block pl-3 pr-10 py-2 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm rounded-md'
        defaultValue='2'
        name={label}
        onChange={onChange}
      >
        {children}
      </select>
    </div>
  );
}
