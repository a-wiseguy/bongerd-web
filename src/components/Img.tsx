import type { SiteImage } from '@/lib/images'

export function Img({
  image,
  className,
  sizes = '(min-width: 1024px) 50vw, 100vw',
  priority = false,
  decorative = false,
}: {
  image: SiteImage
  className?: string
  sizes?: string
  priority?: boolean
  decorative?: boolean
}) {
  return (
    <img
      src={image.src}
      srcSet={image.srcSet}
      sizes={image.srcSet ? sizes : undefined}
      alt={decorative ? '' : image.alt}
      width={image.width}
      height={image.height}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      className={className}
    />
  )
}
