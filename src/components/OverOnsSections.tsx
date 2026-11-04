import type { LucideIcon } from 'lucide-react'
import {
  Accessibility,
  BadgeCheck,
  CameraOff,
  CigaretteOff,
  Dog,
  Handshake,
  MessageCircle,
  Scale,
  ShieldAlert,
  Users,
} from 'lucide-react'
import { complaintSteps, complaintsHtml, houseRulesParts } from '@/lib/overOnsContent'
import { toSafeHtml } from '@/lib/sanitize'

const ruleIcons: LucideIcon[] = [
  Users,
  ShieldAlert,
  CameraOff,
  Accessibility,
  Dog,
  CigaretteOff,
  BadgeCheck,
]

function iconForRule(text: string, index: number): LucideIcon {
  const lower = text.toLowerCase()
  if (lower.includes('privacy')) return Users
  if (lower.includes('agressie') || lower.includes('intimidatie')) return ShieldAlert
  if (lower.includes('foto') || lower.includes('opnamen')) return CameraOff
  if (lower.includes('zitplaats') || lower.includes('valide')) return Accessibility
  if (lower.includes('hond')) return Dog
  if (lower.includes('roken') || lower.includes('sigaret')) return CigaretteOff
  if (lower.includes('legitimatie') || lower.includes('afhalen')) return BadgeCheck
  return ruleIcons[index % ruleIcons.length]!
}

export function HouseRulesBody({ text }: { text: string }) {
  const { intro, rules } = houseRulesParts(text)

  if (!rules.length) {
    return (
      <div className="text-muted">
        <div className="prose-site" dangerouslySetInnerHTML={{ __html: toSafeHtml(text) }} />
      </div>
    )
  }

  return (
    <div className="text-muted">
      {intro ? <p className="mb-5 text-[1.05rem] leading-relaxed text-ink">{intro}</p> : null}
      <ul className="grid gap-3 sm:grid-cols-2">
        {rules.map((rule, index) => {
          const Icon = iconForRule(rule, index)
          return (
            <li
              key={rule}
              className="flex gap-3 rounded-2xl border border-line/80 bg-mist/70 p-4 text-[1.02rem] leading-snug text-ink"
            >
              <span
                className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-teal shadow-sm"
                aria-hidden
              >
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <span>{rule}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

const complaintStepMeta = [
  { label: 'Eerst bespreken', icon: MessageCircle },
  { label: 'Bemiddeling', icon: Handshake },
  { label: 'Geschillencommissie', icon: Scale },
] as const

export function ComplaintsBody({ text }: { text: string }) {
  const steps = complaintSteps(text)

  if (steps.length < 2) {
    return (
      <div className="prose-site text-muted [&_a]:font-semibold">
        <div dangerouslySetInnerHTML={{ __html: complaintsHtml(text) }} />
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {steps.map((step, index) => {
        const meta = complaintStepMeta[index] ?? {
          label: `Stap ${index + 1}`,
          icon: Scale,
        }
        const Icon = meta.icon

        return (
          <article
            key={`${index}-${step.slice(0, 24)}`}
            className="rounded-2xl border border-line bg-gradient-to-br from-white to-mist/80 p-5 sm:p-6"
          >
            <div className="flex items-start gap-4">
              <span
                className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-mint text-teal"
                aria-hidden
              >
                <Icon className="h-6 w-6" strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold uppercase tracking-wide text-teal">{meta.label}</p>
                <div
                  className="prose-site mt-2 text-muted [&_a]:font-semibold"
                  dangerouslySetInnerHTML={{ __html: complaintsHtml(step) }}
                />
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}

export function OverOnsPageNav({
  items,
}: {
  items: { id: string; label: string }[]
}) {
  return (
    <nav aria-label="Op deze pagina" className="rounded-[1.8rem] border border-line bg-white p-5 shadow-card lg:sticky lg:top-24">
      <p className="text-sm font-semibold uppercase tracking-wide text-teal">Op deze pagina</p>
      <ul className="mt-4 grid gap-1">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="flex min-h-11 items-center rounded-xl px-3 text-[0.98rem] font-semibold text-navy transition hover:bg-mist focus-visible:bg-mist"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
