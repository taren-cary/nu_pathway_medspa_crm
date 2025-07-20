import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { supabase } from '../lib/supabase';

function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('Needs Attention'); // Changed from 'all'
  
  const fetchContacts = async () => {
    setLoading(true);
    
    let query = supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching contacts:', error);
    } else {
      setContacts(data || []);
    }
    
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    
    let query = supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching contacts:', error);
    } else {
      setContacts(data || []);
    }
    
    setRefreshing(false);
  };
  
  useEffect(() => {
    fetchContacts();
  }, [statusFilter]);
  
  const updateContactStatus = async (id, status) => {
    const { error } = await supabase
      .from('contacts')
      .update({ status })
      .eq('id', id);
    
    if (error) {
      console.error('Error updating contact status:', error);
    } else {
      fetchContacts();
    }
  };
  
  const formatDate = (timestamp) => {
    return formatInTimeZone(
      new Date(timestamp),
      'America/New_York',
      'MMM d, yyyy'
    );
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
  
  return (
    <div className="animate-fade-in">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Contacts</h1>
        
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
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-primary-500 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('Needs Attention')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                statusFilter === 'Needs Attention'
                  ? 'bg-primary-500 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              Needs Attention
            </button>
            <button
              onClick={() => setStatusFilter('Contacted')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                statusFilter === 'Contacted'
                  ? 'bg-primary-500 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              Contacted
            </button>
            <button
              onClick={() => setStatusFilter('Booked')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                statusFilter === 'Booked'
                  ? 'bg-primary-500 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              Booked
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
      ) : contacts.length === 0 ? (
        <div className="card text-center py-12">
          <i className="ph ph-user-circle-x text-5xl text-neutral-300 mb-4"></i>
          <h3 className="text-xl font-medium text-neutral-600 mb-2">No contacts found</h3>
          <p className="text-neutral-500">
            {statusFilter !== 'all' 
              ? `There are no contacts with status "${statusFilter}".` 
              : 'There are no contacts in the system yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map((contact) => (
            <div key={contact.id} className="card p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <Link to={`/contacts/${contact.id}`} className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center mr-3">
                    {contact.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-medium text-primary-700">{contact.name}</h3>
                    <p className="text-sm text-neutral-500">{contact.phone}</p>
                  </div>
                </Link>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeClass(contact.status)}`}>
                  {contact.status}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <p className="text-gray-600">
                  <span className="font-medium">Phone:</span> {contact.phone}
                </p>
                {contact.email && (
                  <p className="text-gray-600">
                    <span className="font-medium">Email:</span> {contact.email}
                  </p>
                )}
                {contact.service_interest && (
                  <p className="text-gray-600">
                    <span className="font-medium">Service Interest:</span> {contact.service_interest}
                  </p>
                )}
                <p className="text-gray-600">
                  <span className="font-medium">Created:</span> {formatDate(contact.created_at)}
                </p>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Update Status:</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={contact.status}
                  onChange={(e) => updateContactStatus(contact.id, e.target.value)}
                >
                  <option value="Needs Attention">Needs Attention</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Booked">Booked</option>
                  <option value="Not Interested">Not Interested</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ContactsPage; 