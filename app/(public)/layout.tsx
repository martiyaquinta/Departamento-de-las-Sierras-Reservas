import { SiteHeader } from "@/components/public/site-header";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="public-shell min-h-dvh overflow-x-hidden bg-background text-foreground">
      <SiteHeader />
      <main className="min-w-0">{children}</main>
    </div>
  );
}
