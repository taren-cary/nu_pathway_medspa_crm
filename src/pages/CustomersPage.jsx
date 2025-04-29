import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { supabase } from '../lib/supabase';

function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const fetchCustomers = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching customers:', error);
    } else {
      setCustomers(data || []);
    }
    
    setLoading(false);
  };
  
  useEffect(() => {
    fetchCustomers();
  }, []);
  
  const formatDate = (timestamp) => {
    return formatInTimeZone(
      new Date(timestamp),
      'America/New_York',
      'MMM d, yyyy'
    );
  };
  
  return (
    <div className="animate-fade-in">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Customers</h1>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <i className="ph ph-magnifying-glass text-neutral-400"></i>
          </div>
          <input
            type="search"
            className="block w-full pl-10 pr-3 py-2 border border-neutral-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Search customers..."
          />
        </div>
      </div>
      
      {loading ? (
        <div className="card animate-pulse">
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex space-x-4">
                <div className="skeleton-text w-1/4 h-6"></div>
                <div className="skeleton-text w-1/4 h-6"></div>
                <div className="skeleton-text w-1/4 h-6"></div>
                <div className="skeleton-text w-1/4 h-6"></div>
              </div>
            ))}
          </div>
        </div>
      ) : customers.length === 0 ? (
        <div className="card text-center py-12">
          <i className="ph ph-users-three text-5xl text-neutral-300 mb-4"></i>
          <h3 className="text-xl font-medium text-neutral-600 mb-2">No customers found</h3>
          <p className="text-neutral-500">Your customer list is empty.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-premium">
              <thead>
                <tr>
                  <th className="table-header">Customer Name</th>
                  <th className="table-header">Phone Number</th>
                  <th className="table-header">Email</th>
                  <th className="table-header">First Booking Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 bg-white">
                {customers.map((customer) => (
                  <tr 
                    key={customer.id}
                    className="hover:bg-neutral-50 transition-colors cursor-pointer"
                  >
                    <td className="table-cell font-medium text-primary-700">
                      <Link to={`/customers/${customer.id}`} className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center mr-3">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        {customer.name}
                      </Link>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center">
                        <i className="ph ph-phone text-neutral-400 mr-2"></i>
                        {customer.phone}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center">
                        <i className="ph ph-envelope text-neutral-400 mr-2"></i>
                        {customer.email}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center">
                        <i className="ph ph-calendar text-neutral-400 mr-2"></i>
                        {formatDate(customer.created_at)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomersPage;
