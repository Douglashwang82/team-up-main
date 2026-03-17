'use client';

import { useState, useEffect } from 'react';
import { apis } from '@/lib/api';
import { VenueSearchResult } from '@team-up-main/api-client';
import Link from 'next/link';
import { MapPin, Search, Navigation } from 'lucide-react';

export default function VenuesPage() {
  const [venues, setVenues] = useState<VenueSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [sportType, setSportType] = useState('');
  const [distance, setDistance] = useState('5000');
  const [useLocation, setUseLocation] = useState(false);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);

  const fetchVenues = async (lat?: number, lng?: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apis.venues.searchVenues({
        sportType: sportType || undefined,
        lat: lat || userLat || undefined,
        lng: lng || userLng || undefined,
        distance: parseFloat(distance) || 5000,
      });
      setVenues(data);
    } catch (err: any) {
      console.error('Failed to fetch venues:', err);
      setError('載入場地失敗，請稍後再試。');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!useLocation) {
      fetchVenues();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useLocation]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVenues();
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError('您的瀏覽器不支援地理位置服務');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLat(position.coords.latitude);
        setUserLng(position.coords.longitude);
        setUseLocation(true);
        fetchVenues(position.coords.latitude, position.coords.longitude);
      },
      (err) => {
        console.error('Error getting location', err);
        setError('無法獲取您的位置，顯示所有場地。');
        setUseLocation(false);
        fetchVenues();
      }
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">探索場地</h1>
        <p className="text-gray-600 mt-2">為您的下一場比賽尋找完美的運動設施。</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">運動項目</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="例如：籃球、網球"
                value={sportType}
                onChange={(e) => setSportType(e.target.value)}
              />
            </div>
          </div>
          
          <div className="sm:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">距離（公尺）</label>
            <input
              type="number"
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              disabled={!useLocation}
            />
          </div>

          <div className="flex items-end gap-3">
            <button
              type="button"
              onClick={requestLocation}
              className={`px-4 py-2 flex items-center gap-2 border rounded-lg font-medium transition-colors ${
                useLocation 
                  ? 'border-blue-600 text-blue-600 bg-blue-50' 
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              <Navigation className="w-4 h-4" />
              {useLocation ? '位置服務已開啟' : '找身邊的場地'}
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              搜尋
            </button>
          </div>
        </form>
      </div>

      {/* Content */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : venues.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">查無場地</h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            嘗試調整搜尋條件或擴大距離範圍。
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map((item) => (
            <Link key={item.venue?.id} href={`/venues/${item.venue?.id}`}>
              <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group h-full flex flex-col cursor-pointer">
                {/* Image Placeholder */}
                <div className="h-48 bg-gradient-to-br from-indigo-100 to-purple-100 relative overflow-hidden">
                  <div className="absolute inset-0 bg-indigo-600/10 group-hover:bg-transparent transition-colors duration-300"></div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {item.venue?.name}
                  </h3>
                  
                  <div className="flex items-start text-sm text-gray-600 mb-4 h-10 overflow-hidden">
                    <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{item.venue?.address}, {item.venue?.city}</span>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                      地區性
                    </span>
                    
                    {item.timeSlots && item.timeSlots.length > 0 && (
                      <span className="text-sm font-medium text-green-600 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                        有空場時段
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
