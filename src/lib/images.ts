export const photos = {
  interior: { src: '/images/interior.jpg', alt: 'De balie van Apotheek De Bongerd' },
  consult: { src: '/images/consult.jpg', alt: 'Gesprek in de spreekkamer' },
  storefront: { src: '/images/storefront.jpg', alt: 'Vestiging van de apotheek aan de straat' },
  orchard: { src: '/images/orchard.jpg', alt: 'Boomgaard, het beeld van De Bongerd' },
  delivery: { src: '/images/delivery.jpg', alt: 'Medicijnen thuisbezorgd' },
  privacy: { src: '/images/privacy.jpg', alt: 'Vertrouwelijk gesprek in de apotheek' },
  john: { src: '/images/john-wisman.jpg', alt: 'Apotheker John Wisman in de apotheek' },
  kluis: { src: '/images/kluis.jpg', alt: 'Afhaalautomaat met pincode' },
  bereiding: { src: '/images/bereiding.jpg', alt: 'Eigen bereiding op de weegschaal' },
  reis: { src: '/images/reisvaccin.jpg', alt: 'Reisvaccinatie en advies' },
  baxter: { src: '/images/baxter.jpg', alt: 'Baxterrollen klaargezet per innamemoment' },
  skincare: { src: '/images/skincare.jpg', alt: 'Huidverzorging in de apotheek' },
} as const

const serviceMap: Record<string, { src: string; alt: string }> = {
  herhaalrecepten: photos.consult,
  herhaalservice: photos.interior,
  bezorgdienst: photos.delivery,
  afhaalautomaat: photos.kluis,
  baxter: photos.baxter,
  bereiding: photos.bereiding,
  medicatiebegeleiding: photos.consult,
  diabetes: photos.consult,
  huidverzorging: photos.skincare,
  medicijnpaspoort: photos.reis,
  reisadvies: photos.reis,
  gesprek: photos.john,
}

export function serviceImage(slug: string, override?: { src?: string | null; alt?: string | null }) {
  if (override?.src) {
    return { src: override.src, alt: override.alt || serviceMap[slug]?.alt || photos.interior.alt }
  }
  return serviceMap[slug] ?? photos.interior
}

export function newsImage(
  post: { imageUrl?: string | null; imageAlt?: string | null },
  fallback: { src: string; alt: string },
) {
  if (post.imageUrl) return { src: post.imageUrl, alt: post.imageAlt || fallback.alt }
  return fallback
}
