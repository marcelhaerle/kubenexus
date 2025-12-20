import './globals.css';
import QueryProvider from '@/components/providers/query-provider';
import Sidebar from '@/components/layout/Sidebar';

export const metadata = {
  title: 'KubeNexus - K8s Management Console',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="h-screen overflow-hidden">
        <QueryProvider>
          <div className="flex h-full">
            <Sidebar />
            <main className="flex-1 flex flex-col overflow-hidden bg-background">
              {/* Header / Top Bar */}
              <header className="flex h-14 items-center border-b px-8 bg-card">
                <div className="text-sm font-medium text-muted-foreground">
                  Cluster Status: <span className="text-green-500 font-bold">Connected</span>
                </div>
              </header>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto p-8">{children}</div>
            </main>
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
