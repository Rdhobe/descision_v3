import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { DashboardContent } from './components/dashboard-content'
import { authOptions } from '@/lib/auth.config'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const dashboardUser = {
    id: session.user.id,
    email: session.user.email || '',
    user_metadata: {
      full_name: session.user.name || '',
      username: session.user.email?.split('@')[0] || ''
    }
  }

  return <DashboardContent user={dashboardUser} />
}
