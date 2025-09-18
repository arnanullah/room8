export const metadata = { title: 'Roommates MVP' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{maxWidth:900,margin:'20px auto',padding:'0 16px',fontFamily:'system-ui'}}>
        <nav style={{display:'flex',gap:12,marginBottom:16}}>
          <a href="/">Home</a>
        </nav>
        {children}
      </body>
    </html>
  );
}
