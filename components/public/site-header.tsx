import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 pt-[env(safe-area-inset-top)] backdrop-blur-sm">
      <div className="mx-auto flex h-12 max-w-5xl items-center justify-between gap-3 px-3 sm:h-14 sm:px-6">
        <Link href="/" className="flex min-h-11 min-w-0 items-center gap-2">
          <Image
            src="/brand/header.jpg"
            alt="De Las Sierras"
            width={36}
            height={36}
            className="h-8 w-8 shrink-0 rounded-full object-cover sm:h-10 sm:w-10"
            priority
          />
          <span className="truncate font-display text-sm font-semibold tracking-tight text-ink sm:text-base">
            De Las Sierras
          </span>
        </Link>
        <Link
          href="/reservar"
          className="inline-flex min-h-10 shrink-0 items-center rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-ink/90 sm:min-h-11 sm:px-5"
        >
          Reservar
        </Link>
      </div>
    </header>
  );
}
