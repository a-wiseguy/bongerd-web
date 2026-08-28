import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { AdminShell } from '@/components/AdminShell'
import { getAdminUser } from '@/server/auth'
import { seo } from '@/lib/seo'

export const Route = createFileRoute('/beheer')({
  loader: async ({ location }) => {
    const user = await getAdminUser()
    const isLogin = location.pathname === '/beheer/login'
    if (!user && !isLogin) throw redirect({ to: '/beheer/login' })
    if (user && isLogin) throw redirect({ to: '/beheer' })
    return { user }
  },
  head: () => ({
    meta: seo({
      title: 'Beheer',
      description: 'Beheeromgeving van Apotheek De Bongerd.',
    }),
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
