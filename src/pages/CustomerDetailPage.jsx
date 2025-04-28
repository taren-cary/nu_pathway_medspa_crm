import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';

function CustomerDetailPage() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchCustomerData = async () => {
      setLoading(true);
      
      // Fetch customer details
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();
      
      if (customerError) {
        console.error('Error fetching customer:', customerError);
        return;
      }
      
      setCustomer(customerData);
      
      // Fetch customer's appointments
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('customer_id', id)
        .order('appointment_time', { ascending: false });
      
      if (appointmentsError) {
        console.error('Error fetching appointments:', appointmentsError);
        return;
      }
      
      setAppointments(appointmentsData || []);
      setLoading(false);
    };
    
    fetchCustomerData();
  }, [id]);
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'Booked':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  if (!customer) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Customer Not Found</h2>
        <Link to="/customers" className="text-primary-600 hover:text-primary-800">
          Back to Customers
        </Link>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6">
        <Link to="/customers" className="text-primary-600 hover:text-primary-800">
          ← Back to Customers
        </Link>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 flex items-center">
          <div className="flex-shrink-0 h-16 w-16 flex items-center justify-center rounded-full bg-primary-100 text-primary-600">
            <span className="text-3xl">👤</span>
          </div>
          <div className="ml-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">{customer.name}</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Customer since {format(new Date(customer.created_at), 'MMMM yyyy')}</p>
          </div>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Phone Number</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{customer.phone}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{customer.email}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">First Booking Date</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {format(new Date(customer.created_at), 'MMMM d, yyyy')}
              </dd>
            </div>
          </dl>
        </div>
      </div>
      
      <div className="mt-8">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Appointment History</h3>
        
        {appointments.length === 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center text-gray-500">
            No appointments found for this customer.
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {appointments.map((appointment) => (
                <li key={appointment.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-primary-100 text-primary-600">
                          <span className="text-xl">📆</span>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-primary-600 truncate">
                            {appointment.service}
                          </p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(appointment.appointment_time), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                    {appointment.notes && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          <span className="font-medium">Notes:</span> {appointment.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomerDetailPage;
