import Image from "next/image";
import Link from "next/link";
import { Gallery } from "@/components/public/gallery";
import { VideoGallery } from "@/components/public/video-gallery";
import { StickyCta } from "@/components/public/sticky-cta";
import { getProperty } from "@/lib/data";
import {
  getPublicPhotoItems,
  LOCAL_HERO_PATH,
  LOCAL_PHOTOS,
  LOCAL_VIDEOS,
} from "@/lib/local-media";
import { formatARS } from "@/lib/utils";
import { buildGenericWhatsAppUrl } from "@/lib/whatsapp";

export default async function HomePage() {
  const property = await getProperty();
  const wa = buildGenericWhatsAppUrl(property.whatsapp_e164);
  const hero = LOCAL_HERO_PATH;
  const photoItems = getPublicPhotoItems();

  const oneNight =
    property.price_one_night != null && property.price_one_night > 0
      ? property.price_one_night
      : property.price_per_night;
  const multi = property.price_per_night;
  const showPromo = oneNight > multi;
  const savePct = showPromo ? Math.round(((oneNight - multi) / oneNight) * 100) : 0;

  const storyA = LOCAL_PHOTOS.find((p) => p.id === "local-03")?.storage_path ?? LOCAL_HERO_PATH;
  const storyB = LOCAL_PHOTOS.find((p) => p.id === "local-06")?.storage_path ?? "/photos/depto-06.jpg";

  return (
    <>
      <section className="relative isolate min-h-[72vh] w-full sm:min-h-[78vh]">
        <Image
          src={hero}
          alt={property.name}
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-black/5"
          aria-hidden
        />

        <div className="relative z-10 mx-auto flex min-h-[72vh] max-w-5xl flex-col justify-end px-4 pb-12 pt-24 sm:min-h-[78vh] sm:px-6 sm:pb-16">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-white/85">
            Tandil · centro
          </p>
          <h1 className="max-w-2xl font-display text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl">
            {property.name}
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-white/90 sm:text-lg">
            {property.tagline ??
              "Tu escapada de fin de semana a las sierras — vista desde el balcón, a pasos del centro."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/reservar"
              className="inline-flex min-h-12 items-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink shadow-sm transition hover:bg-white/95"
            >
              Reservar finde
            </Link>
            <a
              href="#fotos"
              className="inline-flex min-h-12 items-center rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
            >
              Ver fotos
            </a>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 pb-28 pt-10 sm:px-6 sm:pt-14">
        <section className="mb-14 border-b border-line pb-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                Un depto para el finde, en el centro
              </h2>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                Vista a las sierras desde el balcón · San Martín e Yrigoyen · se camina a
                dique, parque y calvario.
              </p>
            </div>
            <ul className="flex flex-wrap gap-2">
              {[
                "2 a 3 personas",
                "Solo findes · vie → dom",
                "Centro Tandil",
                "Sin mascotas",
              ].map((chip) => (
                <li
                  key={chip}
                  className="rounded-full border border-line bg-transparent px-3.5 py-1.5 text-sm text-ink"
                >
                  {chip}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="fotos" className="mb-16 scroll-mt-20">
          <div className="mb-5 flex items-baseline justify-between gap-4">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              El lugar
            </h2>
            <p className="text-sm text-muted-foreground">{LOCAL_PHOTOS.length} fotos</p>
          </div>
          <Gallery items={photoItems} />
        </section>

        {LOCAL_VIDEOS.length > 0 && (
          <section id="videos" className="mb-16 scroll-mt-20">
            <div className="mb-5 flex items-baseline justify-between gap-4">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                Videos
              </h2>
              <p className="text-sm text-muted-foreground">{LOCAL_VIDEOS.length} clips</p>
            </div>
            <VideoGallery videos={LOCAL_VIDEOS} />
          </section>
        )}

        <section className="mb-16">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-5">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                Cómo es quedarse acá
              </h2>
              {property.description ? (
                <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-foreground/90">
                  {property.description}
                </p>
              ) : (
                <p className="mt-4 text-base leading-relaxed text-foreground/90">
                  Depto equipado para 2 a 3 personas, en pleno centro de Tandil. Ideal para
                  un finde: llegás viernes, te vas domingo.
                </p>
              )}
              <p className="mt-4 text-sm text-muted-foreground">
                Check-in {property.check_in_time ?? "15:00"} · Check-out{" "}
                {property.check_out_time ?? "11:00"}
              </p>
            </div>
            <div className="space-y-4 lg:col-span-7">
              <div className="relative aspect-[16/10] overflow-hidden bg-transparent">
                <Image
                  src={storyA}
                  alt="Interior del departamento"
                  fill
                  className="object-contain sm:object-cover"
                  sizes="(max-width: 1024px) 100vw, 55vw"
                />
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="order-2 lg:order-1 lg:col-span-7">
              <div className="relative mx-auto aspect-[3/4] max-h-[560px] w-full max-w-md overflow-hidden bg-transparent lg:mx-0 lg:max-w-none">
                <Image
                  src={storyB}
                  alt="Ambiente del departamento"
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
              </div>
            </div>
            <div className="order-1 flex flex-col justify-center lg:order-2 lg:col-span-5">
              <h3 className="font-display text-xl font-semibold text-ink sm:text-2xl">
                Centro caminable
              </h3>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                {property.address_text ?? "San Martín e Yrigoyen, Tandil"}. Desde acá llegás
                a pie al dique, al parque Independencia y al Calvario. El finde se arma sin
                auto si querés.
              </p>
              {property.maps_url && (
                <a
                  href={property.maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-terracota underline-offset-4 hover:underline"
                >
                  Abrir en Google Maps
                </a>
              )}
            </div>
          </div>
        </section>

        {property.amenities.length > 0 && (
          <section className="mb-16 border-y border-line py-12">
            <h2 className="mb-6 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Qué hay en el depto
            </h2>
            <ul className="columns-1 gap-x-12 sm:columns-2">
              {property.amenities.map((a) => (
                <li
                  key={a}
                  className="mb-2.5 break-inside-avoid border-b border-line py-2 text-[15px] leading-snug text-foreground/90"
                >
                  {a}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-muted-foreground">No se aceptan mascotas.</p>
          </section>
        )}

        <section className="mb-16">
          <div className="border border-line bg-transparent px-5 py-8 sm:px-10 sm:py-10">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                Precio
              </h2>
              <span className="rounded-full bg-terracota px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                Descuento por estadía prolongada
              </span>
            </div>

            <div className="mt-8 grid gap-8 sm:grid-cols-[1fr_auto] sm:items-end">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-terracota">
                  Con 2 o más noches
                </p>
                <p className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
                  {formatARS(multi)}
                  <span className="ml-2 font-sans text-base font-normal text-muted-foreground">
                    / noche
                  </span>
                </p>
                {showPromo && (
                  <p className="mt-2 text-sm font-medium text-ink/80">
                    {savePct > 0
                      ? `${savePct}% menos que la tarifa de 1 noche`
                      : "Mejor precio por noche"}
                  </p>
                )}
                <p className="mt-4 text-sm text-muted-foreground">
                  Tarifa 1 noche:{" "}
                  <span
                    className={
                      showPromo
                        ? "line-through decoration-ink/40"
                        : "font-semibold text-ink"
                    }
                  >
                    {formatARS(oneNight)}
                  </span>
                  {showPromo && <span className="ml-1 text-xs">(sin descuento)</span>}
                </p>
                {property.cleaning_fee > 0 && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    + limpieza {formatARS(property.cleaning_fee)}
                  </p>
                )}
                <p className="mt-3 max-w-md text-xs leading-relaxed text-muted-foreground">
                  Montos en pesos. El finde típico (vie–dom, 2 noches) entra en el descuento
                  por estadía prolongada.
                </p>
              </div>

              <Link
                href="/reservar"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-ink px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-ink/90 sm:w-auto"
              >
                Ver disponibilidad
              </Link>
            </div>
          </div>
        </section>

        {property.house_rules && (
          <section className="mb-16">
            <h2 className="mb-3 font-display text-xl font-semibold text-ink sm:text-2xl">
              Para que estemos bien
            </h2>
            <p className="max-w-2xl whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {property.house_rules}
            </p>
          </section>
        )}

        <section className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/reservar"
            className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full bg-ink px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-ink/90"
          >
            Reservar finde
          </Link>
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full border border-line bg-transparent px-6 py-3.5 text-sm font-semibold text-ink transition hover:border-ink/40"
            >
              Consultar por WhatsApp
            </a>
          )}
        </section>

        <footer className="border-t border-line pt-8 text-sm text-muted-foreground">
          <p className="font-display text-base font-semibold text-ink">De Las Sierras</p>
          <p className="mt-2">{property.address_text ?? "San Martín e Yrigoyen, Tandil"}</p>
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block font-medium text-terracota hover:underline"
            >
              WhatsApp
            </a>
          )}
        </footer>
      </div>

      <StickyCta
        priceFrom={property.price_per_night}
        priceOneNight={
          property.price_one_night != null && property.price_one_night > 0
            ? property.price_one_night
            : null
        }
      />
    </>
  );
}
