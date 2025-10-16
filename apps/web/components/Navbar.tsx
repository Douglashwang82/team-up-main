'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const accessToken = localStorage.getItem('access_token');
    setIsLoggedIn(!!accessToken);

    // Get username from localStorage if available
    const storedUsername = localStorage.getItem('username');
    setUsername(storedUsername);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    setUsername(null);
    router.push('/login');
  };

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/');

  return (
    <nav style={{
      backgroundColor: '#1f2937',
      color: 'white',
      padding: '0 1rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '64px'
      }}>
        {/* Logo */}
        <div
          onClick={() => router.push('/')}
          style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span style={{ fontSize: '1.75rem' }}>⚽</span>
          <span>TeamUp</span>
        </div>

        {/* Navigation Links */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center'
        }}>
          <NavLink
            label="Home"
            path="/"
            isActive={pathname === '/'}
            onClick={() => router.push('/')}
          />
          <NavLink
            label="TeamUps"
            path="/teamups"
            isActive={isActive('/teamups')}
            onClick={() => router.push('/teamups')}
          />
          <NavLink
            label="Venues"
            path="/venues"
            isActive={isActive('/venues')}
            onClick={() => router.push('/venues')}
          />
          <NavLink
            label="My Bookings"
            path="/bookings"
            isActive={isActive('/bookings')}
            onClick={() => router.push('/bookings')}
          />
        </div>

        {/* User Section */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center'
        }}>
          {isLoggedIn ? (
            <>
              {username && (
                <span style={{
                  fontSize: '0.875rem',
                  color: '#d1d5db',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  <span style={{ fontSize: '1.25rem' }}>👤</span>
                  {username}
                </span>
              )}
              <button
                onClick={handleLogout}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => router.push('/login')}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'transparent',
                  color: 'white',
                  border: '1px solid white',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Login
              </button>
              <button
                onClick={() => router.push('/signup')}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

interface NavLinkProps {
  label: string;
  path: string;
  isActive: boolean;
  onClick: () => void;
}

function NavLink({ label, path, isActive, onClick }: NavLinkProps) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '0.5rem 0.75rem',
        backgroundColor: isActive ? '#374151' : 'transparent',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: isActive ? 600 : 500,
        transition: 'background-color 0.2s',
        borderBottom: isActive ? '2px solid #3b82f6' : '2px solid transparent'
      }}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.backgroundColor = '#374151';
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {label}
    </button>
  );
}
