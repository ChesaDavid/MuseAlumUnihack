export const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={`rounded-2xl border shadow p-4 bg-white ${className}`}>
      {children}
    </div>
  );
};

export const CardContent = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return <div className={className}>{children}</div>;
};
