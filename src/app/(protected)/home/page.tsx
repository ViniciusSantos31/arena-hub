export default function ProtectedPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Protected Page</h1>
      <p className="text-muted-foreground text-balance">
        This page is only accessible to authenticated users.
      </p>
    </div>
  );
}
