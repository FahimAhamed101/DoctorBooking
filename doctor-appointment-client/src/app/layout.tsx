

import { Providers } from "@/redux/provider";
import "./globals.css";



//import { RouteGuard } from '../components/RouteGuard';
export default function RootLayout({




  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

//const protectedRoutes = ['/dashboard', '/profile'];
//const authRoutes = ['/login', '/register'];

// <RouteGuard protectedRoutes={protectedRoutes} authRoutes={authRoutes}></RouteGuard>
  return (
    <html lang="en">
      <body>   <Providers>  {children}  </Providers></body>
    </html>
  );
}
