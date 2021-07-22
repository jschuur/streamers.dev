export default function Section({ children, className }) {
  return (
    <div
      className={`my-4 shadow-md sm:rounded-lg bg-white dark:bg-gray-600 overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}
