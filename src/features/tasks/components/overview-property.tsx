interface OverViewPropertyProps {
  label: string;
  children: React.ReactNode;
}
export const OverViewProperty = ({
  label,
  children,
}: OverViewPropertyProps) => {
  return (
    <div className="flex items-center gap-x-2">
      <div className="min-w-[100px]">
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
      <div className="flex items-center gap-x-2">{children}</div>
    </div>
  );
};
