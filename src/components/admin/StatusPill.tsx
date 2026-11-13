const tones = {
  online: 'bg-mint text-teal',
  scheduled: 'bg-white text-warn ring-1 ring-warn/40',
  draft: 'bg-mist text-muted',
} as const

export type StatusTone = keyof typeof tones

export function StatusPill({ tone, children }: { tone: StatusTone; children: React.ReactNode }) {
  return (
    <span className={`inline-flex min-h-7 shrink-0 items-center rounded-full px-3 text-sm font-semibold ${tones[tone]}`}>
      {children}
    </span>
  )
}

export function newsStatus(post: { published: boolean; publishedAt: Date | string }, now = new Date()) {
  if (!post.published) return { tone: 'draft' as const, label: 'Verborgen', live: false }
  if (new Date(post.publishedAt) > now) return { tone: 'scheduled' as const, label: 'Gepland', live: false }
  return { tone: 'online' as const, label: 'Online', live: true }
}
