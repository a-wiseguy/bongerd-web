import { useEffect, useState } from 'react'
import { useRouterState } from '@tanstack/react-router'
import { ChevronUp } from 'lucide-react'

type ScrollToTopProps = {
  /** sit above fixed mobile action bar on small screens */
  aboveMobileBar?: boolean
}

export function ScrollToTop({ aboveMobileBar = false }: ScrollToTopProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const header = document.querySelector('header')
    const threshold = () => (header?.offsetHeight ?? 72) + 8

    const update = () => {
      setVisible(window.scrollY > threshold())
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update, { passive: true })
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [pathname])

  const scrollUp = () => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
    document.getElementById('inhoud')?.focus({ preventScroll: true })
    document.getElementById('beheer-inhoud')?.focus({ preventScroll: true })
  }

  const bottomPosition = aboveMobileBar
    ? 'bottom-[calc(5.25rem+env(safe-area-inset-bottom,0px))] sm:bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] lg:bottom-6'
    : 'bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:bottom-6'

  return (
    <button
      type="button"
      aria-label="Terug naar boven"
      title="Terug naar boven"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      onClick={scrollUp}
      className={`scroll-top-btn fixed ${bottomPosition} right-4 z-30 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-navy text-white shadow-card transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none motion-reduce:translate-y-0 sm:right-6 sm:h-[3.25rem] sm:w-[3.25rem] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-navy ${
        visible
          ? 'pointer-events-auto translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-2 opacity-0'
      }`}
    >
      <ChevronUp className="h-6 w-6" strokeWidth={2.25} aria-hidden />
    </button>
  )
}
