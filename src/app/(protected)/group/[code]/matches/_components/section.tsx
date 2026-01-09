export const FormSection = ({ children }: { children: React.ReactNode }) => {
  return (
    <section className="flex w-full flex-col space-y-4">{children}</section>
  );
};
