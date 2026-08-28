export const SITE_NAME = 'Apotheek De Bongerd'
export const SITE_TAGLINE = 'Zorg om de hoek in Kesteren, Ochten en Rhenen'

export function seo({
  title,
  description,
  url,
  image = '/brand/logo.png',
}: {
  title: string
  description: string
  url?: string
  image?: string
}) {
  const full = title.includes(SITE_NAME) ? title : `${title} · ${SITE_NAME}`
  return [
    { title: full },
    { name: 'description', content: description },
    { property: 'og:title', content: full },
    { property: 'og:description', content: description },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: SITE_NAME },
    ...(url ? [{ property: 'og:url', content: url }] : []),
    { property: 'og:image', content: image },
    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:title', content: full },
    { name: 'twitter:description', content: description },
  ]
}

export function pharmacyJsonLd(locations: {
  name: string
  address: string
  postal: string
  city: string
  phone: string
  email: string
  mapsQuery: string
}[]) {
  const origin = process.env.SITE_URL ?? 'https://apotheekdebongerd.nl'
  return {
    '@context': 'https://schema.org',
    '@graph': locations.map((loc) => ({
      '@type': 'Pharmacy',
      name: `Apotheek De Bongerd ${loc.name}`,
      parentOrganization: {
        '@type': 'Organization',
        name: SITE_NAME,
        url: origin,
      },
      url: `${origin}/contact`,
      telephone: loc.phone,
      email: loc.email,
      image: `${origin}/brand/logo.png`,
      address: {
        '@type': 'PostalAddress',
        streetAddress: loc.address,
        postalCode: loc.postal,
        addressLocality: loc.city,
        addressCountry: 'NL',
      },
      geo: undefined,
      hasMap: `https://maps.google.com/?q=${encodeURIComponent(loc.mapsQuery)}`,
      openingHoursSpecification: loc.name === 'Kesteren'
        ? [
            {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
              opens: '08:00',
              closes: '17:00',
            },
          ]
        : [
            {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
              opens: '08:00',
              closes: '17:30',
            },
          ],
    })),
  }
}
