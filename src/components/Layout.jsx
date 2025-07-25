import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import logo from '../assets/logo.svg';

function Layout() {
  const location = useLocation();
  const { signOut, user } = useAuth();
  
  return (
    <div className="min-h-screen bg-neutral-50">
      <nav className="nav-container">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <img src={logo} alt="Nu Pathway MedSpa Logo" className="h-10 w-auto mr-3" />
                <h1 className="text-xl font-display font-bold text-primary-600">Nu Pathway MedSpa</h1>
              </div>
              <div className="ml-8 flex space-x-8">
                <Link
                  to="/contacts"
                  className={`nav-link ${
                    location.pathname.includes('/contacts')
                      ? 'text-primary-600 after:w-full'
                      : ''
                  }`}
                >
                  <i className="ph ph-user mr-2"></i> Contacts
                </Link>
                <Link
                  to="/calls"
                  className={`nav-link ${
                    location.pathname === '/' || location.pathname === '/calls'
                      ? 'text-primary-600 after:w-full'
                      : ''
                  }`}
                >
                  <i className="ph ph-phone mr-2"></i> Calls
                </Link>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-neutral-600">{user?.email}</span>
                <button 
                  onClick={signOut}
                  className="text-sm text-neutral-600 hover:text-primary-600 flex items-center"
                >
                  <i className="ph ph-sign-out mr-1"></i> Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="dashboard-container">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
