'use client';

import { useRouter } from 'next/navigation';

export default function Page(){
  const router = useRouter();

  return(
    <div style={{textAlign:'center',padding:'3rem 1rem'}}>
      <h1 style={{fontSize:'3rem',marginBottom:'1rem',color:'#1f2937'}}>
        Welcome to TeamUp! ⚽
      </h1>
      <p style={{fontSize:'1.25rem',color:'#6b7280',marginBottom:'2rem',maxWidth:'600px',margin:'0 auto 2rem'}}>
        Find teammates, book venues, and organize sports activities together.
      </p>

      <div style={{display:'flex',gap:'1rem',justifyContent:'center',marginBottom:'3rem'}}>
        <button
          onClick={() => router.push('/teamups')}
          style={{
            padding:'1rem 2rem',
            backgroundColor:'#3b82f6',
            color:'white',
            border:'none',
            borderRadius:'8px',
            fontSize:'1.125rem',
            fontWeight:600,
            cursor:'pointer',
            transition:'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
        >
          Browse TeamUps
        </button>
        <button
          onClick={() => router.push('/venues')}
          style={{
            padding:'1rem 2rem',
            backgroundColor:'#10b981',
            color:'white',
            border:'none',
            borderRadius:'8px',
            fontSize:'1.125rem',
            fontWeight:600,
            cursor:'pointer',
            transition:'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
        >
          Find Venues
        </button>
      </div>

      <div style={{
        display:'grid',
        gridTemplateColumns:'repeat(auto-fit, minmax(250px, 1fr))',
        gap:'1.5rem',
        marginTop:'3rem',
        textAlign:'left'
      }}>
        <FeatureCard
          emoji="👥"
          title="Find Teammates"
          description="Connect with people who share your passion for sports"
        />
        <FeatureCard
          emoji="🏟️"
          title="Book Venues"
          description="Reserve courts and facilities for your activities"
        />
        <FeatureCard
          emoji="📅"
          title="Organize Events"
          description="Create TeamUps and manage participants easily"
        />
        <FeatureCard
          emoji="⚡"
          title="Quick & Easy"
          description="Simple booking process with instant confirmations"
        />
      </div>
    </div>
  )
}

function FeatureCard({emoji, title, description}: {emoji:string, title:string, description:string}) {
  return (
    <div style={{
      padding:'1.5rem',
      border:'1px solid #e5e7eb',
      borderRadius:'8px',
      backgroundColor:'#f9fafb'
    }}>
      <div style={{fontSize:'2.5rem',marginBottom:'0.5rem'}}>{emoji}</div>
      <h3 style={{fontSize:'1.25rem',fontWeight:600,marginBottom:'0.5rem',color:'#1f2937'}}>{title}</h3>
      <p style={{color:'#6b7280',fontSize:'0.875rem'}}>{description}</p>
    </div>
  );
}