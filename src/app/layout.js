// app/layout.js
import './globals.css'; // Import your global styles if needed

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>My Next.js App</title>
        {/* Add meta tags, links, and other head elements here */}
      </head>
      <body>{children}</body>
    </html>
  );
}

