import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { supabase } from '../lib/supabase';

function CallsPage() {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeframe, setTimeframe] = useState('today');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  
  const fetchCalls = async (timeRange) => {
    setLoading(true);
    
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

  const getTimeRange = () => {
    const now = new Date();
    
    if (timeframe === 'custom') {
      if (!customDateRange.startDate || !customDateRange.endDate) {
        return null;
      }
      return {
        start: startOfDay(parseISO(customDateRange.startDate)).toISOString(),
        end: endOfDay(parseISO(customDateRange.endDate)).toISOString(),
      };
    } else if (timeframe === 'today') {
      return {
        start: startOfDay(now).toISOString(),
        end: endOfDay(now).toISOString(),
      };
    } else if (timeframe === 'week') {
      return {
        start: startOfWeek(now, { weekStartsOn: 1 }).toISOString(),
        end: endOfWeek(now, { weekStartsOn: 1 }).toISOString(),
      };
    } else if (timeframe === 'month') {
      return {
        start: startOfMonth(now).toISOString(),
        end: endOfMonth(now).toISOString(),
      };
    }
    return null;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    const timeRange = getTimeRange();
    if (timeRange) {
      await fetchCalls(timeRange);
    }
    setRefreshing(false);
  };

  const handleCustomDateSearch = () => {
    if (customDateRange.startDate && customDateRange.endDate) {
      setTimeframe('custom');
      setShowDatePicker(false);
      const timeRange = getTimeRange();
      if (timeRange) {
        fetchCalls(timeRange);
      }
    }
  };

  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);
    if (newTimeframe !== 'custom') {
      setCustomDateRange({ startDate: '', endDate: '' });
    }
  };
  
  useEffect(() => {
    const timeRange = getTimeRange();
    if (timeRange) {
      fetchCalls(timeRange);
    }
  }, [timeframe]);
  
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

  const getTimeframeDisplayText = () => {
    if (timeframe === 'custom' && customDateRange.startDate && customDateRange.endDate) {
      const start = format(parseISO(customDateRange.startDate), 'MMM d');
      const end = format(parseISO(customDateRange.endDate), 'MMM d, yyyy');
      return `${start} - ${end}`;
    }
    return null;
  };
  
  return (
    <div className="animate-fade-in">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Call History</h1>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center px-3 py-2 text-sm font-medium text-neutral-600 hover:text-primary-600 hover:bg-neutral-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <i className={`ph ph-arrow-clockwise text-lg mr-1 ${refreshing ? 'animate-spin' : ''}`}></i>
            Refresh
          </button>

          {/* Calendar Button */}
          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center px-3 py-2 text-sm font-medium text-neutral-600 hover:text-primary-600 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <i className="ph ph-calendar text-lg mr-1"></i>
              Calendar
            </button>

            {/* Date Picker Popup */}
            {showDatePicker && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-neutral-200 z-50 p-4">
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Select Date Range</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={customDateRange.startDate}
                        onChange={(e) => setCustomDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                      <input
                        type="date"
                        value={customDateRange.endDate}
                        onChange={(e) => setCustomDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={handleCustomDateSearch}
                    disabled={!customDateRange.startDate || !customDateRange.endDate}
                    className="flex-1 bg-primary-500 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Search
                  </button>
                  <button
                    onClick={() => setShowDatePicker(false)}
                    className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex space-x-2 bg-white p-1 rounded-lg shadow-sm border border-neutral-200">
            <button
              onClick={() => handleTimeframeChange('today')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeframe === 'today'
                  ? 'bg-primary-500 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => handleTimeframeChange('week')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeframe === 'week'
                  ? 'bg-primary-500 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => handleTimeframeChange('month')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeframe === 'month'
                  ? 'bg-primary-500 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              This Month
            </button>
            {timeframe === 'custom' && customDateRange.startDate && customDateRange.endDate && (
              <button
                className="px-4 py-2 rounded-md text-sm font-medium bg-blue-100 text-blue-800"
                disabled
              >
                {getTimeframeDisplayText()}
              </button>
            )}
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
          <p className="text-neutral-500">
            {timeframe === 'custom' 
              ? `There are no calls recorded for the selected date range.`
              : 'There are no calls recorded for this timeframe.'
            }
          </p>
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider" colSpan="2">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {calls.map((call) => (
                  <React.Fragment key={call.id}>
                    <tr>
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
                    </tr>
                    <tr id={`summary-${call.id}`} className="hidden bg-gray-50">
                      <td colSpan="6" className="px-6 py-4">
                        <div className="text-sm">
                          <h4 className="font-medium text-gray-900 mb-2">Call Summary</h4>
                          <p className="text-gray-700 whitespace-pre-wrap">{call.summary || "No summary available"}</p>
                        </div>
                      </td>
                    </tr>
                    <tr id={`transcript-${call.id}`} className="hidden bg-gray-50">
                      <td colSpan="6" className="px-6 py-4">
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

      {/* Click outside to close date picker */}
      {showDatePicker && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDatePicker(false)}
        ></div>
      )}
    </div>
  );
}

export default CallsPage;
