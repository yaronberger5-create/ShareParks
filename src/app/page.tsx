import { getCurrentUser } from '@/actions/auth-actions';
import { HomeClient } from './home-client';

export default async function HomePage() {
  const user = await getCurrentUser();

  return <HomeClient isLoggedIn={!!user} isOwner={user?.is_owner ?? false} />;
}
