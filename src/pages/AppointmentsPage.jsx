import { useState, useEffect } from 'react';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { supabase } from '../lib/supabase';

function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState('today');
  
  const fetchAppointments = async () => {
    setLoading(true);
    
    let timeRange = {};
    const now = new Date();
    
    if (timeFrame === 'today') {
      timeRange = {
        start: startOfDay(now).toISOString(),
        end: endOfDay(now).toISOString(),
      };
    } else if (timeFrame === 'week') {
      timeRange = {
        start: startOfWeek(now, { weekStartsOn: 1 }).toISOString(),
        end: endOfWeek(now, { weekStartsOn: 1 }).toISOString(),
      };
    } else if (timeFrame === 'month') {
      timeRange = {
        start: startOfMonth(now).toISOString(),
        end: endOfMonth(now).toISOString(),
      };
    }
    
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        customers (
          id,
          name,
          phone,
          email
        )
      `)
      .gte('appointment_time', timeRange.start)
      .lte('appointment_time', timeRange.end)
      .order('appointment_time', { ascending: true });
    
    if (error) {
      console.error('Error fetching appointments:', error);
    } else {
      setAppointments(data || []);
    }
    
    setLoading(false);
  };
  
  const markAsCompleted = async (id) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'Completed' })
      .eq('id', id);
    
    if (error) {
      console.error('Error updating appointment:', error);
    } else {
      fetchAppointments();
    }
  };
  
  useEffect(() => {
    fetchAppointments();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchAppointments();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [timeFrame]);
  
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
  
  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Appointments</h2>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <div className="flex rounded-md shadow-sm">
            <button
              type="button"
              onClick={() => setTimeFrame('today')}
              className={`relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                timeFrame === 'today'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setTimeFrame('week')}
              className={`relative inline-flex items-center px-4 py-2 border-t border-b border-gray-300 text-sm font-medium ${
                timeFrame === 'week'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              This Week
            </button>
            <button
              type="button"
              onClick={() => setTimeFrame('month')}
              className={`relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                timeFrame === 'month'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              This Month
            </button>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center text-gray-500">
          No appointments found for this time period.
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
                          {appointment.customers.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {appointment.service}
                        </p>
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        <span className="truncate">{appointment.customers.phone}</span>
                      </p>
                      <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                        <span className="truncate">{appointment.customers.email}</span>
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p>
                        {format(new Date(appointment.appointment_time), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                  {appointment.notes && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Notes:</span> {appointment.notes}
                      </p>
                    </div>
                  )}
                  {appointment.status === 'Booked' && (
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => markAsCompleted(appointment.id)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Mark as Completed
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default AppointmentsPage;
