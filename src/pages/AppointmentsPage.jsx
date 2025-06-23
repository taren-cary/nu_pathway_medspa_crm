import { useState, useEffect } from 'react';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { supabase } from '../lib/supabase';

function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeframe, setTimeframe] = useState('today');
  
  const fetchAppointments = async () => {
    setLoading(true);
    
    let timeRange = {};
    const now = new Date();
    
    if (timeframe === 'today') {
      timeRange = {
        start: startOfDay(now).toISOString(),
        end: endOfDay(now).toISOString(),
      };
    } else if (timeframe === 'week') {
      timeRange = {
        start: startOfWeek(now, { weekStartsOn: 1 }).toISOString(),
        end: endOfWeek(now, { weekStartsOn: 1 }).toISOString(),
      };
    } else if (timeframe === 'month') {
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

  const handleRefresh = async () => {
    setRefreshing(true);
    
    let timeRange = {};
    const now = new Date();
    
    if (timeframe === 'today') {
      timeRange = {
        start: startOfDay(now).toISOString(),
        end: endOfDay(now).toISOString(),
      };
    } else if (timeframe === 'week') {
      timeRange = {
        start: startOfWeek(now, { weekStartsOn: 1 }).toISOString(),
        end: endOfWeek(now, { weekStartsOn: 1 }).toISOString(),
      };
    } else if (timeframe === 'month') {
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
    
    setRefreshing(false);
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
  }, [timeframe]);
  
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
  
  const formatAppointmentTime = (timestamp) => {
    return formatInTimeZone(
      new Date(timestamp),
      'America/New_York',
      'MMM d, yyyy • h:mm a'
    );
  };
  
  return (
    <div className="animate-fade-in">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Appointments</h1>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center px-3 py-2 text-sm font-medium text-neutral-600 hover:text-primary-600 hover:bg-neutral-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <i className={`ph ph-arrow-clockwise text-lg mr-1 ${refreshing ? 'animate-spin' : ''}`}></i>
            Refresh
          </button>
          
          <div className="flex space-x-2 bg-white p-1 rounded-lg shadow-sm border border-neutral-200">
            <button
              onClick={() => setTimeframe('today')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeframe === 'today'
                  ? 'bg-primary-500 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setTimeframe('week')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeframe === 'week'
                  ? 'bg-primary-500 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setTimeframe('month')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeframe === 'month'
                  ? 'bg-primary-500 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              This Month
            </button>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="skeleton-circle"></div>
                <div className="space-y-2 flex-1">
                  <div className="skeleton-text w-1/2"></div>
                  <div className="skeleton-text w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <div className="card text-center py-12">
          <i className="ph ph-calendar-x text-5xl text-neutral-300 mb-4"></i>
          <h3 className="text-xl font-medium text-neutral-600 mb-2">No appointments found</h3>
          <p className="text-neutral-500">There are no appointments scheduled for this timeframe.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="card-appointment animate-slide-up">
              <div className="flex justify-between mb-3">
                <div className="flex items-center">
                  <i className="ph ph-calendar-check text-primary-500 text-lg mr-2"></i>
                  <span className="text-sm font-medium text-neutral-500">
                    {formatAppointmentTime(appointment.appointment_time)}
                  </span>
                </div>
                <span className={getStatusColor(appointment.status)}>
                  {appointment.status === 'Booked' && <i className="ph ph-clock text-blue-700"></i>}
                  {appointment.status === 'Completed' && <i className="ph ph-check-circle text-green-700"></i>}
                  {appointment.status === 'Cancelled' && <i className="ph ph-x-circle text-red-700"></i>}
                  {appointment.status}
                </span>
              </div>
              
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                  {appointment.customers.name}
                </h3>
                <div className="flex items-center text-neutral-600 text-sm">
                  <i className="ph ph-sparkle text-secondary-500 mr-1.5"></i>
                  {appointment.service}
                </div>
              </div>
              
              {appointment.notes && (
                <div className="bg-neutral-50 rounded-md p-3 text-sm text-neutral-600 border border-neutral-200">
                  <i className="ph ph-note-pencil text-neutral-400 mr-1.5"></i>
                  {appointment.notes}
                </div>
              )}
              
              {appointment.status === 'Booked' && (
                <div className="mt-4 flex justify-end">
                  <button 
                    onClick={() => markAsCompleted(appointment.id)}
                    className="btn-secondary text-sm py-1.5"
                  >
                    <i className="ph ph-check mr-1.5"></i>
                    Mark as Completed
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AppointmentsPage;
