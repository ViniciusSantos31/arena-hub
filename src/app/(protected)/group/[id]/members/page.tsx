import { DataTable } from "./_components/data-table";

import data from "./_components/data.json";

export default function MembersPage() {
  return <DataTable data={data} />;
}
