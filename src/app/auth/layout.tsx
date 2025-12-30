export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-muted flex min-h-dvh flex-col items-center justify-center p-6 md:p-10">
      <div className="h-full w-full max-w-sm md:max-w-3xl">{children}</div>
    </div>
  );
}
