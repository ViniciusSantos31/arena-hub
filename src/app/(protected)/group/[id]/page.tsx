import { getGroupDetails } from "@/actions/group/detail";
import Image from "next/image";
import { notFound } from "next/navigation";

type GroupPageProps = {
  params: Promise<{ id: string }>;
};

export default async function GroupPage({ params }: GroupPageProps) {
  const { id } = await params;
  const group = await getGroupDetails({ id });

  if (!group.data) return notFound();

  const { name, logo, metadata: stringMetadata, createdAt } = group.data;

  const metadata: {
    description: string | null;
  } = stringMetadata ? JSON.parse(stringMetadata) : null;

  return (
    <main>
      <section>
        <div className="flex flex-col space-y-1">
          <span className="text-muted-foreground text-sm">
            Você está visualizando o grupo
          </span>
          <div className="flex items-center space-x-2">
            {logo && (
              <Image
                src={logo}
                alt={name}
                width={24}
                height={24}
                className="h-8 w-8 rounded-sm object-cover"
              />
            )}
            <h1 className="text-2xl font-bold">{name}</h1>
          </div>
        </div>
      </section>
      <section></section>
    </main>
  );
}
