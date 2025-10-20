'use client';

import { useState } from 'react';
import { useTeamUps } from '@/lib/hooks/useTeamUps';
import Link from 'next/link';

export default function TeamUpsPage() {
  // const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  // const [visibilityFilter, setVisibilityFilter] = useState<string | undefined>(undefined);
  // const { teamups, isLoading, error } = useTeamUps({
  //   status: statusFilter,
  //   visibility: visibilityFilter,
  // });

  // function getStatusColor(status: string): string {
  //   switch (status) {
  //     case 'open':
  //       return 'bg-green-100 text-green-800';
  //     case 'closed':
  //       return 'bg-blue-100 text-blue-800';
  //     case 'cancelled':
  //       return 'bg-red-100 text-red-800';
  //     default:
  //       return 'bg-gray-100 text-gray-800';
  //   }
  // }

  // function getProgressPercentage(current: number, max: number): number {
  //   return Math.min((current / max) * 100, 100);
  // }
  return     <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <div className="mb-8">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-t-4 border-indigo-600"></div>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          TeamUp
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Loading your workspace...
        </p>
      </div>
    </div>;
  // return (
  //   <div className="max-w-5xl mx-auto space-y-6">
  //     <div className="flex items-center justify-between">
  //       <h1 className="text-3xl font-bold text-gray-900">TeamUps</h1>
  //       <div className="flex gap-3">
  //         <Link
  //           href="/teamups/my"
  //           className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
  //         >
  //           My TeamUps
  //         </Link>
  //         <Link
  //           href="/teamups/new"
  //           className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
  //         >
  //           Create TeamUp
  //         </Link>
  //       </div>
  //     </div>

  //     {/* Filters */}
  //     <div className="bg-white rounded-lg border border-gray-200 p-4">
  //       <div className="flex gap-4">
  //         <div>
  //           <label className="block text-sm font-medium text-gray-700 mb-1">
  //             Status
  //           </label>
  //           <select
  //             value={statusFilter || ''}
  //             onChange={(e) => setStatusFilter(e.target.value || undefined)}
  //             className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
  //           >
  //             <option value="">All Statuses</option>
  //             <option value="open">Open</option>
  //             <option value="closed">Closed</option>
  //             <option value="cancelled">Cancelled</option>
  //           </select>
  //         </div>

  //         <div>
  //           <label className="block text-sm font-medium text-gray-700 mb-1">
  //             Visibility
  //           </label>
  //           <select
  //             value={visibilityFilter || ''}
  //             onChange={(e) => setVisibilityFilter(e.target.value || undefined)}
  //             className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
  //           >
  //             <option value="">All</option>
  //             <option value="public">Public</option>
  //             <option value="private">Private</option>
  //           </select>
  //         </div>

  //         {(statusFilter || visibilityFilter) && (
  //           <div className="flex items-end">
  //             <button
  //               onClick={() => {
  //                 setStatusFilter(undefined);
  //                 setVisibilityFilter(undefined);
  //               }}
  //               className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
  //             >
  //               Clear Filters
  //             </button>
  //           </div>
  //         )}
  //       </div>
  //     </div>

  //     {error && (
  //       <div className="rounded-md border border-red-400 bg-red-50 p-3 text-sm text-red-800">
  //         {error.message}
  //       </div>
  //     )}

  //     {isLoading && (
  //       <div className="text-center py-12 text-gray-600">Loading TeamUps...</div>
  //     )}

  //     {!isLoading && teamups.length === 0 && (
  //       <div className="text-center py-12 space-y-4">
  //         <p className="text-gray-600">No TeamUps found. Try adjusting your filters or create one!</p>
  //         <Link
  //           href="/teamups/new"
  //           className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
  //         >
  //           Create Your First TeamUp
  //         </Link>
  //       </div>
  //     )}

  //     {/* TeamUps List */}
  //     <div className="space-y-4">
  //       {teamups.map((teamup) => (
  //         <Link
  //           key={teamup.id}
  //           href={`/teamups/${teamup.id}`}
  //           className="block bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-500 hover:shadow-md transition-all"
  //         >
  //           <div className="flex justify-between items-start">
  //             <div className="flex-1">
  //               <div className="flex items-center gap-3 mb-2">
  //                 <h2 className="text-xl font-semibold text-gray-900">
  //                   {teamup.title}
  //                 </h2>
  //                 <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(teamup.status)}`}>
  //                   {teamup.status}
  //                 </span>
  //                 {teamup.visibility === 'private' && (
  //                   <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
  //                     Private
  //                   </span>
  //                 )}
  //               </div>

  //               {teamup.description && (
  //                 <p className="text-gray-600 mb-4">{teamup.description}</p>
  //               )}

  //               <div className="flex items-center gap-6 text-sm text-gray-500 mb-3">
  //                 <span>
  //                   Created {new Date(teamup.created_at).toLocaleDateString()}
  //                 </span>
  //                 {teamup.durantion_type === 'recurring' && (
  //                   <span className="flex items-center gap-1">
  //                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  //                     </svg>
  //                     Recurring
  //                   </span>
  //                 )}
  //               </div>

  //               {/* Participants Progress */}
  //               <div className="space-y-2">
  //                 <div className="flex justify-between items-center text-sm">
  //                   <span className="font-medium text-gray-700">
  //                     Participants: {teamup.current_participants}/{teamup.max_participants}
  //                   </span>
  //                   <span className="text-gray-500">
  //                     {Math.round(getProgressPercentage(teamup.current_participants, teamup.max_participants))}%
  //                   </span>
  //                 </div>
  //                 <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
  //                   <div
  //                     className="h-full bg-blue-600 transition-all duration-300"
  //                     style={{
  //                       width: `${getProgressPercentage(teamup.current_participants, teamup.max_participants)}%`
  //                     }}
  //                   />
  //                 </div>
  //               </div>
  //             </div>

  //             <div className="ml-4">
  //               <button
  //                 className={`px-6 py-2 rounded-lg font-medium transition-colors ${
  //                   teamup.status === 'open'
  //                     ? 'bg-blue-600 hover:bg-blue-700 text-white'
  //                     : 'bg-gray-200 text-gray-500 cursor-not-allowed'
  //                 }`}
  //                 disabled={teamup.status !== 'open'}
  //               >
  //                 {teamup.status === 'open' ? 'View & Join' : 'View'}
  //               </button>
  //             </div>
  //           </div>
  //         </Link>
  //       ))}
  //     </div>
  //   </div>
  // );
}
