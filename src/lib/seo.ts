import { openingHoursSpecification, type DayException, type DayHours } from './hours'

export const SITE_NAME = 'Apotheek De Bongerd'
export const SHARE_IMAGE = { src: '/images/share.jpg', width: 1200, height: 630 }

type HeadContext = { matches: ReadonlyArray<{ loaderData?: unknown }> }

export function siteUrlFrom(ctx: HeadContext) {
  const data = ctx.matches[0]?.loaderData as { siteUrl?: string } | undefined
  return data?.siteUrl ?? ''
}

export function pageHead(
  ctx: HeadContext,
  {
    title,
    description,
    path,
    image,
    type = 'website',
    publishedTime,
    noindex = false,
  }: {
    title: string
    description: string
    path?: string
    image?: string
    type?: 'website' | 'article'
    publishedTime?: string
    noindex?: boolean
  },
) {
  const origin = siteUrlFrom(ctx)
  const full = title.includes(SITE_NAME) ? title : `${title} · ${SITE_NAME}`
  const absolute = (value: string) => (/^https?:\/\//.test(value) ? value : `${origin}${value}`)
  const imageUrl = absolute(image ?? SHARE_IMAGE.src)
  const meta = [
    { title: full },
    { name: 'description', content: description },
    { property: 'og:title', content: full },
    { property: 'og:description', content: description },
    { property: 'og:type', content: type },
    { property: 'og:site_name', content: SITE_NAME },
    { property: 'og:locale', content: 'nl_NL' },
    { property: 'og:image', content: imageUrl },
    ...(image ? [] : [
      { property: 'og:image:width', content: String(SHARE_IMAGE.width) },
      { property: 'og:image:height', content: String(SHARE_IMAGE.height) },
    ]),
    ...(path ? [{ property: 'og:url', content: absolute(path) }] : []),
    ...(publishedTime ? [{ property: 'article:published_time', content: publishedTime }] : []),
    { name: 'twitter:card', content: 'summary_large_image' },
    ...(noindex ? [{ name: 'robots', content: 'noindex, nofollow' }] : []),
  ]
  const links = path && !noindex ? [{ rel: 'canonical', href: absolute(path) }] : []
  return { meta, links }
}

type JsonLdLocation = {
  location: {
    name: string
    address: string
    postal: string
    city: string
    phone: string
    email: string
    mapsQuery: string
  }
  hours: DayHours[]
  exceptions: DayException[]
}

export function pharmacyJsonLd(origin: string, bundles: JsonLdLocation[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': bundles.map(({ location, hours, exceptions }) => ({
      '@type': 'Pharmacy',
      name: `${SITE_NAME} ${location.name}`,
      parentOrganization: { '@type': 'Organization', name: SITE_NAME, url: origin },
      url: `${origin}/contact`,
      telephone: location.phone,
      email: location.email,
      image: `${origin}${SHARE_IMAGE.src}`,
      address: {
        '@type': 'PostalAddress',
        streetAddress: location.address,
        postalCode: location.postal,
        addressLocality: location.city,
        addressCountry: 'NL',
      },
      hasMap: `https://maps.google.com/?q=${encodeURIComponent(location.mapsQuery)}`,
      openingHoursSpecification: openingHoursSpecification(hours),
      ...(exceptions.length
        ? {
            specialOpeningHoursSpecification: exceptions.map((item) => ({
              '@type': 'OpeningHoursSpecification',
              validFrom: item.date,
              validThrough: item.date,
              ...(item.isClosed || !item.opens || !item.closes
                ? { opens: '00:00', closes: '00:00' }
                : { opens: item.opens.slice(0, 5), closes: item.closes.slice(0, 5) }),
            })),
          }
        : {}),
    })),
  }
}

/** json for a <script> tag; escapes chars that could close it */
export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/[<>&\u2028\u2029]/g, (character) =>
    `\\u${character.charCodeAt(0).toString(16).padStart(4, '0')}`,
  )
}
