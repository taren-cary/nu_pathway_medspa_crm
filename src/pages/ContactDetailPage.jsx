import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { supabase } from '../lib/supabase';

function ContactDetailPage() {
  const { id } = useParams();
  const [contact, setContact] = useState(null);
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  
  useEffect(() => {
    const fetchContactData = async () => {
      setLoading(true);
      
      // Fetch contact details
      const { data: contactData, error: contactError } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', id)
        .single();
      
      if (contactError) {
        console.error('Error fetching contact:', contactError);
        return;
      }
      
      setContact(contactData);
      setNotes(contactData.notes || '');
      
      // Fetch contact's calls
      const { data: callsData, error: callsError } = await supabase
        .from('calls')
        .select('*')
        .eq('contact_id', id)
        .order('call_time', { ascending: false });
      
      if (callsError) {
        console.error('Error fetching calls:', callsError);
        return;
      }
      
      setCalls(callsData || []);
      setLoading(false);
    };
    
    fetchContactData();
  }, [id]);
  
  const updateContactStatus = async (status) => {
    const { error } = await supabase
      .from('contacts')
      .update({ status })
      .eq('id', id);
    
    if (error) {
      console.error('Error updating contact status:', error);
    } else {
      setContact({ ...contact, status });
    }
  };
  
  const saveNotes = async () => {
    const { error } = await supabase
      .from('contacts')
      .update({ notes })
      .eq('id', id);
    
    if (error) {
      console.error('Error saving notes:', error);
    } else {
      alert('Notes saved successfully');
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
  
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Needs Attention':
        return 'bg-yellow-100 text-yellow-800';
      case 'Contacted':
        return 'bg-blue-100 text-blue-800';
      case 'Booked':
        return 'bg-green-100 text-green-800';
      case 'Not Interested':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  if (!contact) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Not Found</h2>
        <Link to="/contacts" className="text-primary-600 hover:text-primary-800">
          Back to Contacts
        </Link>
      </div>
    );
  }
  
  return (
    <div className="animate-fade-in">
      <div className="dashboard-header">
        <div className="flex items-center">
          <Link to="/contacts" className="mr-4 text-neutral-500 hover:text-primary-600 transition-colors">
            <i className="ph ph-arrow-left text-lg"></i>
          </Link>
          <h1 className="dashboard-title">Contact Details</h1>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Info Card */}
        <div className="card lg:col-span-1">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-2xl font-semibold mb-4">
              {contact.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-semibold text-neutral-900">{contact.name}</h2>
            <span className={`mt-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(contact.status)}`}>
              {contact.status}
            </span>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center p-3 bg-neutral-50 rounded-lg">
              <i className="ph ph-phone text-primary-500 text-lg mr-3"></i>
              <div>
                <p className="text-xs text-neutral-500 font-medium">Phone Number</p>
                <p className="text-neutral-900">{contact.phone}</p>
              </div>
            </div>
            
            {contact.email && (
              <div className="flex items-center p-3 bg-neutral-50 rounded-lg">
                <i className="ph ph-envelope text-primary-500 text-lg mr-3"></i>
                <div>
                  <p className="text-xs text-neutral-500 font-medium">Email Address</p>
                  <p className="text-neutral-900">{contact.email}</p>
                </div>
              </div>
            )}
            
            {contact.service_interest && (
              <div className="flex items-center p-3 bg-neutral-50 rounded-lg">
                <i className="ph ph-sparkle text-primary-500 text-lg mr-3"></i>
                <div>
                  <p className="text-xs text-neutral-500 font-medium">Service Interest</p>
                  <p className="text-neutral-900">{contact.service_interest}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center p-3 bg-neutral-50 rounded-lg">
              <i className="ph ph-calendar text-primary-500 text-lg mr-3"></i>
              <div>
                <p className="text-xs text-neutral-500 font-medium">Contact Since</p>
                <p className="text-neutral-900">{format(new Date(contact.created_at), 'MMMM d, yyyy')}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Update Status:</label>
            <select
              className="w-full border rounded-lg px-3 py-2"
              value={contact.status}
              onChange={(e) => updateContactStatus(e.target.value)}
            >
              <option value="Needs Attention">Needs Attention</option>
              <option value="Contacted">Contacted</option>
              <option value="Booked">Booked</option>
              <option value="Not Interested">Not Interested</option>
            </select>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes:</label>
            <textarea
              className="w-full border rounded-lg px-3 py-2 min-h-[120px]"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this contact..."
            ></textarea>
            <button
              onClick={saveNotes}
              className="mt-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
            >
              Save Notes
            </button>
          </div>
        </div>
        
        {/* Call History */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Call History</h2>
            
            {calls.length === 0 ? (
              <div className="text-center py-8">
                <i className="ph ph-phone-x text-4xl text-neutral-300 mb-3"></i>
                <p className="text-neutral-500">No call history available for this contact.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Time</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Duration</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Summary</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Transcript</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {calls.map((call) => (
                      <tr key={call.id} className={call.needs_followup ? 'bg-yellow-50' : ''}>
                        <td className="px-4 py-3">{formatDateTime(call.call_time)}</td>
                        <td className="px-4 py-3">{formatDuration(call.duration)}</td>
                        <td className="px-4 py-3">
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
                          <div className="relative group">
                            <button className="text-blue-500 hover:underline">View Summary</button>
                            <div className="absolute left-0 top-full mt-2 w-96 bg-white shadow-lg rounded p-4 z-10 hidden group-hover:block">
                              {call.summary || "No summary available"}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="relative group">
                            <button className="text-blue-500 hover:underline">View Transcript</button>
                            <div className="absolute left-0 top-full mt-2 w-96 bg-white shadow-lg rounded p-4 z-10 hidden group-hover:block max-h-96 overflow-y-auto">
                              <pre className="whitespace-pre-wrap text-sm">
                                {call.transcript || "No transcript available"}
                              </pre>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactDetailPage; 