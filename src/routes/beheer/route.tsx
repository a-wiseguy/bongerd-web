import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { AdminShell } from '@/components/AdminShell'
import { getAdminUser } from '@/server/auth'
import { pageHead } from '@/lib/seo'

export const Route = createFileRoute('/beheer')({
  loader: async ({ location }) => {
    const user = await getAdminUser()
    const isLogin = location.pathname === '/beheer/login'
    if (!user && !isLogin) throw redirect({ to: '/beheer/login' })
    if (user && isLogin) throw redirect({ to: '/beheer' })
    return { user }
  },
  head: (ctx) =>
    pageHead(ctx, {
      title: 'Beheer',
      description: 'Beheeromgeving van Apotheek De Bongerd.',
      noindex: true,
    }),
  component: BeheerLayout,
})

function BeheerLayout() {
  const { user } = Route.useLoaderData()
  if (!user) return <Outlet />
  return (
    <AdminShell email={user.email}>
      <Outlet />
    </AdminShell>
  )
}
