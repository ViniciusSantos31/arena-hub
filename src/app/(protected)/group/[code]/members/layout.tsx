export default function GroupMembersLayout({
  children,
  tabs,
}: {
  children: React.ReactNode;
  tabs: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      {children}
      {tabs}
    </div>
  );
}
