import { Outlet } from 'react-router-dom';
import { Navbar } from '../landing/Navbar';
import { Footer } from '../landing/Footer';

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-base font-sans antialiased text-primary">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
