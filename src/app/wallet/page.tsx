import { redirect } from 'next/navigation';
import { getWallet } from '@/actions/wallet-actions';
import { WalletClient } from './wallet-client';

export default async function WalletPage() {
  const result = await getWallet();

  if (!result.success) {
    redirect('/login');
  }

  return (
    <WalletClient
      balance={result.balance}
      totalEarned={result.totalEarned}
      totalWithdrawn={result.totalWithdrawn}
      transactions={result.transactions}
      pendingWithdrawals={result.pendingWithdrawals}
    />
  );
}
