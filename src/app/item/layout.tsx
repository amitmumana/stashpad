export default function ItemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/30">
      <main className="flex-1">{children}</main>
    </div>
  );
}
