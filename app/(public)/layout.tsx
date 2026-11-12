import { SiteHeader } from "@/components/public/site-header";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="public-shell min-h-dvh bg-background text-foreground">
      <SiteHeader />
      <main>{children}</main>
    </div>
  );
}
