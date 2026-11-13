export type SiteImage = {
  src: string
  alt: string
  srcSet?: string
  width: number
  height: number
}

function local(name: string, alt: string, width = 1536, height = 1024): SiteImage {
  return {
    src: `/images/${name}-1600.webp`,
    srcSet: `/images/${name}-800.webp 800w, /images/${name}-1600.webp ${width}w`,
    alt,
    width,
    height,
  }
}

export const photos = {
  interior: local('interior', 'De balie van Apotheek De Bongerd'),
  consult: local('consult', 'Gesprek in de spreekkamer'),
  storefront: local('storefront', 'Vestiging van de apotheek aan de straat'),
  orchard: local('orchard', 'Boomgaard in bloei, het beeld van De Bongerd'),
  delivery: local('delivery', 'Medicijnen worden thuisbezorgd'),
  privacy: local('privacy', 'Vertrouwelijk gesprek in de apotheek'),
  john: local('john-wisman', 'Apotheker John Wisman in de apotheek', 850, 567),
  kluis: local('kluis', 'Afhaalautomaat met pincode', 850, 567),
  bereiding: local('bereiding', 'Eigen bereiding op de weegschaal', 850, 567),
  reis: local('reisvaccin', 'Reisvaccinatie en advies', 1600, 600),
  baxter: local('baxter', 'Baxterrollen klaargezet per innamemoment'),
  skincare: local('skincare', 'Huidverzorging in de apotheek'),
} as const

const serviceMap: Record<string, SiteImage> = {
  herhaalrecepten: photos.consult,
  herhaalservice: photos.interior,
  bezorgdienst: photos.delivery,
  afhaalautomaat: photos.kluis,
  baxter: photos.baxter,
  bereiding: photos.bereiding,
  medicatiebegeleiding: photos.privacy,
  diabetes: photos.consult,
  huidverzorging: photos.skincare,
  medicijnpaspoort: photos.reis,
  reisadvies: photos.reis,
  gesprek: photos.john,
}

const newsFallbacks = [photos.orchard, photos.storefront, photos.interior, photos.consult]

function uploaded(src: string, alt: string): SiteImage {
  const resized = /^\/uploads\/[a-z0-9-]+\.webp$/i.test(src) && !src.endsWith('-800.webp')
  return {
    src,
    alt,
    srcSet: resized ? `${src.replace(/\.webp$/i, '-800.webp')} 800w, ${src} 1600w` : undefined,
    width: 1600,
    height: 1067,
  }
}

export function serviceImage(slug: string, override?: { src?: string | null; alt?: string | null }): SiteImage {
  const fallback = serviceMap[slug] ?? photos.interior
  if (override?.src) return uploaded(override.src, override.alt || fallback.alt)
  return fallback
}

// rotate by list position so adjacent cards never share a photo
export function newsImage(post: { imageUrl?: string | null; imageAlt?: string | null }, index: number): SiteImage {
  const fallback = newsFallbacks[index % newsFallbacks.length]!
  if (post.imageUrl) return uploaded(post.imageUrl, post.imageAlt || fallback.alt)
  return fallback
}

export function blockImage(
  block: { imageUrl?: string | null; imageAlt?: string | null } | undefined,
  fallback: SiteImage,
): SiteImage {
  if (block?.imageUrl) return uploaded(block.imageUrl, block.imageAlt || fallback.alt)
  return fallback
}
