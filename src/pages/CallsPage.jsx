import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { supabase } from '../lib/supabase';

function CallsPage() {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeframe, setTimeframe] = useState('today');
  
  const fetchCalls = async () => {
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
      .from('calls')
      .select(`
        *,
        contacts (
          id,
          name,
          phone,
          email,
          status
        )
      `)
      .gte('call_time', timeRange.start)
      .lte('call_time', timeRange.end)
      .order('call_time', { ascending: false });
    
    if (error) {
      console.error('Error fetching calls:', error);
    } else {
      setCalls(data || []);
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
      .from('calls')
      .select(`
        *,
        contacts (
          id,
          name,
          phone,
          email,
          status
        )
      `)
      .gte('call_time', timeRange.start)
      .lte('call_time', timeRange.end)
      .order('call_time', { ascending: false });
    
    if (error) {
      console.error('Error fetching calls:', error);
    } else {
      setCalls(data || []);
    }
    
    setRefreshing(false);
  };
  
  useEffect(() => {
    fetchCalls();
  }, [timeframe]);
  
  const updateFollowupStatus = async (id, status) => {
    const needsFollowup = status !== 'Completed' && status !== 'Booked';
    
    const { error } = await supabase
      .from('calls')
      .update({ 
        followup_status: status,
        needs_followup: needsFollowup
      })
      .eq('id', id);
    
    if (error) {
      console.error('Error updating call status:', error);
    } else {
      fetchCalls();
    }
  };
  
  const formatDateTime = (timestamp) => {
    return formatInTimeZone(
      new Date(timestamp),
      'America/New_York',
      'MMM d, yyyy • h:mm a'
    );
  };
  
  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="animate-fade-in">
      <div className="dashboard-header">
        <h1 className="dashboard-title">After-Hours Calls</h1>
        
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
        <div className="card animate-pulse p-6">
          <div className="h-8 bg-neutral-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-neutral-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-neutral-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
        </div>
      ) : calls.length === 0 ? (
        <div className="card text-center py-12">
          <i className="ph ph-phone-x text-5xl text-neutral-300 mb-4"></i>
          <h3 className="text-xl font-medium text-neutral-600 mb-2">No calls found</h3>
          <p className="text-neutral-500">There are no calls recorded for this timeframe.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Duration</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider" colSpan="2">Details</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {calls.map((call) => (
                  <React.Fragment key={call.id}>
                    <tr className={call.needs_followup ? 'bg-yellow-50' : ''}>
                      <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(call.call_time)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{call.phone_number}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{formatDuration(call.duration)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {call.contacts ? (
                          <Link 
                            to={`/contacts/${call.contacts.id}`}
                            className="text-blue-500 hover:underline"
                          >
                            {call.contacts.name}
                          </Link>
                        ) : (
                          <span className="text-neutral-400">No contact</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-sm ${
                          call.followup_status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          call.followup_status === 'Completed' ? 'bg-green-100 text-green-800' :
                          call.followup_status === 'Booked' ? 'bg-blue-100 text-blue-800' :
                          'bg-neutral-100 text-neutral-800'
                        }`}>
                          {call.followup_status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button 
                          className="text-blue-500 hover:underline"
                          onClick={() => {
                            document.getElementById(`summary-${call.id}`).classList.toggle('hidden');
                            document.getElementById(`transcript-${call.id}`).classList.add('hidden');
                          }}
                        >
                          View Summary
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button 
                          className="text-blue-500 hover:underline"
                          onClick={() => {
                            document.getElementById(`transcript-${call.id}`).classList.toggle('hidden');
                            document.getElementById(`summary-${call.id}`).classList.add('hidden');
                          }}
                        >
                          View Transcript
                        </button>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <select
                          className="border rounded px-2 py-1"
                          value={call.followup_status}
                          onChange={(e) => updateFollowupStatus(call.id, e.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Completed">Completed</option>
                          <option value="Booked">Booked</option>
                        </select>
                      </td>
                    </tr>
                    <tr id={`summary-${call.id}`} className="hidden bg-gray-50">
                      <td colSpan="8" className="px-6 py-4">
                        <div className="text-sm">
                          <h4 className="font-medium text-gray-900 mb-2">Call Summary</h4>
                          <p className="text-gray-700 whitespace-pre-wrap">{call.summary || "No summary available"}</p>
                        </div>
                      </td>
                    </tr>
                    <tr id={`transcript-${call.id}`} className="hidden bg-gray-50">
                      <td colSpan="8" className="px-6 py-4">
                        <div className="text-sm">
                          <h4 className="font-medium text-gray-900 mb-2">Call Transcript</h4>
                          <pre className="text-gray-700 whitespace-pre-wrap overflow-x-auto max-h-96 overflow-y-auto">{call.transcript || "No transcript available"}</pre>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default CallsPage;
