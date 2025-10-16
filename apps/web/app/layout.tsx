import Navbar from '@/components/Navbar';
import './globals.css';

export default function RootLayout({children}:{children:React.ReactNode}){
  return(
    <html lang='en'>
      <body style={{margin:0,padding:0}}>
        <Navbar />
        <main style={{padding:'1rem',maxWidth:'1200px',margin:'0 auto'}}>
          {children}
        </main>
      </body>
    </html>
  )
}