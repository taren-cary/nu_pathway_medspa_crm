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
        return 'status-tag status-booked';
      case 'Completed':
        return 'status-tag status-completed';
      case 'Cancelled':
        return 'status-tag status-cancelled';
      default:
        return 'status-tag bg-gray-100 text-gray-800';
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
    <div className="animate-fade-in">
      <div className="dashboard-header">
        <div className="flex items-center">
          <Link to="/customers" className="mr-4 text-neutral-500 hover:text-primary-600 transition-colors">
            <i className="ph ph-arrow-left text-lg"></i>
          </Link>
          <h1 className="dashboard-title">Customer Details</h1>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Info Card */}
        <div className="card lg:col-span-1">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-2xl font-semibold mb-4">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-semibold text-neutral-900">{customer.name}</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center p-3 bg-neutral-50 rounded-lg">
              <i className="ph ph-phone text-primary-500 text-lg mr-3"></i>
              <div>
                <p className="text-xs text-neutral-500 font-medium">Phone Number</p>
                <p className="text-neutral-900">{customer.phone}</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-neutral-50 rounded-lg">
              <i className="ph ph-envelope text-primary-500 text-lg mr-3"></i>
              <div>
                <p className="text-xs text-neutral-500 font-medium">Email Address</p>
                <p className="text-neutral-900">{customer.email}</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-neutral-50 rounded-lg">
              <i className="ph ph-calendar text-primary-500 text-lg mr-3"></i>
              <div>
                <p className="text-xs text-neutral-500 font-medium">Customer Since</p>
                <p className="text-neutral-900">{format(new Date(customer.created_at), 'MMMM d, yyyy')}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Appointment History */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-neutral-900">Appointment History</h3>
            <span className="bg-primary-100 text-primary-700 text-sm font-medium px-2.5 py-0.5 rounded-full">
              {appointments.length} Appointments
            </span>
          </div>
          
          {appointments.length === 0 ? (
            <div className="text-center py-8">
              <i className="ph ph-calendar-x text-4xl text-neutral-300 mb-3"></i>
              <p className="text-neutral-600">No appointment history found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="border border-neutral-200 rounded-lg overflow-hidden">
                  <div className="bg-neutral-50 px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center">
                      <i className="ph ph-calendar-check text-primary-500 mr-2"></i>
                      <span className="font-medium text-neutral-700">
                        {format(new Date(appointment.appointment_time), 'MMMM d, yyyy')}
                      </span>
                    </div>
                    <span className={getStatusColor(appointment.status)}>
                      {appointment.status === 'Booked' && <i className="ph ph-clock text-blue-700 mr-1.5"></i>}
                      {appointment.status === 'Completed' && <i className="ph ph-check-circle text-green-700 mr-1.5"></i>}
                      {appointment.status === 'Cancelled' && <i className="ph ph-x-circle text-red-700 mr-1.5"></i>}
                      {appointment.status}
                    </span>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center mb-3">
                      <i className="ph ph-clock text-neutral-400 mr-2"></i>
                      <span className="text-neutral-700">
                        {format(new Date(appointment.appointment_time), 'h:mm a')}
                      </span>
                    </div>
                    
                    <div className="flex items-center mb-3">
                      <i className="ph ph-sparkle text-secondary-500 mr-2"></i>
                      <span className="text-neutral-700 font-medium">{appointment.service}</span>
                    </div>
                    
                    {appointment.notes && (
                      <div className="bg-neutral-50 rounded-md p-3 text-sm text-neutral-600 border border-neutral-100">
                        <i className="ph ph-note-pencil text-neutral-400 mr-1.5"></i>
                        {appointment.notes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CustomerDetailPage;
