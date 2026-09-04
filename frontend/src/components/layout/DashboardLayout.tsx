import Sidebar from "./Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#dce2e8]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Dashboard Area */}
      <main className="ml-[320px] min-h-screen px-5">
        {children}
      </main>
    </div>
  );
}