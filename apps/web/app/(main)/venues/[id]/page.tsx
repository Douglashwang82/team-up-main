'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { apis } from '@/lib/api';
import { VenueDetail } from '@team-up-main/api-client';
import { MapPin, Map, Phone, Clock, FileText } from 'lucide-react';
import Link from 'next/link';

export default function VenueDetailPage() {
  const { id } = useParams() as { id: string };
  
  const [venue, setVenue] = useState<VenueDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        setIsLoading(true);
        const data = await apis.venues.getVenueById({ venueId: id });
        setVenue(data);
      } catch (err) {
        console.error('Failed to fetch venue', err);
        setError('找不到場地或載入失敗。');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchVenue();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 text-center font-medium">
          {error || '找不到場地'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* Venue Header Header Image */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="h-48 md:h-64 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center p-8 relative">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10 w-full">
             <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 shadow-sm">{venue.name}</h1>
             <div className="flex items-center text-blue-50 text-sm md:text-base mb-2">
                <MapPin className="w-5 h-5 mr-2" />
                <span>{venue.address}, {venue.city}</span>
             </div>
          </div>
        </div>
        
        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-gray-600">
           <div className="flex flex-col">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">場地資訊</span>
              <p className="flex items-start">
                 <FileText className="w-4 h-4 mr-2 mt-1 text-gray-400" />
                 此場地正在營運中，歡迎預約。
              </p>
           </div>
           
           <div className="flex flex-col space-y-4">
              <div>
                <span className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1 block">聯絡方式</span>
                <p className="flex items-center">
                   <Phone className="w-4 h-4 mr-2 text-gray-400" />
                   {venue.contactPhone || '尚未提供'}
                </p>
              </div>
              <div>
                <span className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1 block">地區</span>
                <p className="text-gray-800 font-medium">
                  {venue.city || '未知'}
                </p>
              </div>
           </div>
           
           <div className="flex flex-col">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">地圖位置</span>
              <div className="bg-gray-100 h-32 rounded-xl flex items-center justify-center text-gray-400 border border-gray-200">
                 <Map className="w-8 h-8 opacity-50" />
                 <span className="ml-2 text-sm">地圖檢視即將推出</span>
              </div>
           </div>
        </div>
      </div>

      {/* Courts Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          可用球場 
          <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">{venue.courts?.length || 0}</span>
        </h2>
        
        {(!venue.courts || venue.courts.length === 0) ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <p className="text-gray-500">此場地尚未新增任何球場。</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venue.courts.map(court => (
              <div key={court.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col hover:border-blue-500 transition-colors">
                 <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{court.name}</h3>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold uppercase">{court.sportType || '運動'}</span>
                 </div>
                 
                 <div className="flex flex-col gap-4 mb-6 flex-1 text-sm text-gray-600">
                    <p>
                      這是一個優質的 {court.sportType || '體育'} 場地，提供優良的預約時段。
                    </p>
                 </div>
                 
                 <Link 
                   href={`/venues/${venue.id}/courts/${court.id}`}
                   className="w-full py-2.5 px-4 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center justify-center"
                 >
                    查看可用時段
                 </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
