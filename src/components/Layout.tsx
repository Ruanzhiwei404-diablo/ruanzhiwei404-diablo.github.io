import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-bg-dark flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col">
        <Outlet />
      </div>
    </div>
  );
}
