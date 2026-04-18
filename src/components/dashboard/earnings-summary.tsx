'use client';

import { TrendingUp, Calendar } from 'lucide-react';

interface EarningsSummaryProps {
  monthlyEarnings: number;
  totalEarnings: number;
  activeBookingsCount: number;
}

export function EarningsSummary({ monthlyEarnings, totalEarnings, activeBookingsCount }: EarningsSummaryProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Monthly earnings */}
      <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-2">
          <Calendar size={18} className="text-gray-400" />
          <span className="text-sm text-gray-500">הכנסות החודש</span>
        </div>
        <p className="text-3xl font-black text-black">
          {monthlyEarnings.toLocaleString('he-IL')}
          <span className="text-base font-medium text-gray-400 mr-1">ש"ח</span>
        </p>
      </div>

      {/* Total earnings */}
      <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp size={18} className="text-gray-400" />
          <span className="text-sm text-gray-500">סה"כ הכנסות</span>
        </div>
        <p className="text-3xl font-black text-black">
          {totalEarnings.toLocaleString('he-IL')}
          <span className="text-base font-medium text-gray-400 mr-1">ש"ח</span>
        </p>
      </div>

      {/* Active bookings */}
      <div className="bg-orange-50 rounded-2xl border border-orange-200 p-5">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          <span className="text-sm text-orange-600">הזמנות פעילות</span>
        </div>
        <p className="text-3xl font-black text-black">
          {activeBookingsCount}
        </p>
      </div>
    </div>
  );
}
