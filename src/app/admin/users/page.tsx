import { listAdminUsers } from "@/actions/admin/users/list";
import {
  PageContainer,
  PageContent,
  PageHeader,
  PageHeaderContent,
} from "@/app/(protected)/_components/page-structure";
import { UsersTable } from "@/app/admin/users/_components/users-table";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // const filters = parseFilters(urlSearchParams);
  const result = await listAdminUsers({ page: 1, pageSize: 20 });

  if (result.serverError && !result.data) {
    return (
      <div className="flex-1 items-center justify-center space-y-6 p-6">
        <h2 className="text-2xl font-semibold tracking-tight">
          Erro ao carregar usuários
        </h2>
      </div>
    );
  }

  const data = result.data ?? {
    items: [],
    page: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 1,
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent
          title="Usuários"
          description="Listagem e suporte à base de usuários da plataforma"
        />
      </PageHeader>
      <PageContent>
        <UsersTable
          initialData={data}
          initialFilters={{ page: 1, pageSize: 20 }}
        />
      </PageContent>
    </PageContainer>
  );
}
