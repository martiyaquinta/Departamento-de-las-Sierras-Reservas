import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-marron/10 bg-crema/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex min-h-12 items-center gap-2.5">
          <Image
            src="/brand/logo-sinfondo.png"
            alt="De Las Sierras"
            width={36}
            height={36}
            className="h-8 w-8 object-contain sm:h-9 sm:w-9"
            priority
          />
          <span className="font-serif text-[15px] font-semibold tracking-tight text-marron sm:text-base">
            De Las Sierras
          </span>
        </Link>
        <Link
          href="/reservar"
          className="inline-flex min-h-11 items-center rounded-full bg-marron px-5 py-2.5 text-sm font-semibold text-crema transition-colors hover:bg-marron/90"
        >
          Reservar finde
        </Link>
      </div>
    </header>
  );
}
