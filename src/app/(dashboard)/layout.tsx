import { redirect } from "next/navigation";
import { getUser } from "@/lib/actions/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) redirect("/giris");

  return (
    <div className="h-screen flex bg-surface overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 paper-bg">
          <div className="page-fold-enter">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
