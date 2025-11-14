export const Button = ({ children, className = "", ...props }: { children: React.ReactNode; className?: string; [key: string]: any }) => {
  return (
    <button
      {...props}
      className={`px-4 py-2 rounded-xl font-medium border bg-black text-white hover:bg-gray-800 transition ${className}`}
    >
      {children}
    </button>
  );
};
