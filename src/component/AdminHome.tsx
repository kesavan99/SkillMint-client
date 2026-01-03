import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { useTranslation } from '../locales';

const API_URL = import.meta.env.VITE_API_BASE_URL;

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  loginMethod: string;
  status: string;
  isActive: boolean;
  lastLogin: string | null;
  loginCount: number;
  createdAt: string;
  profilePicture: string | null;
  designation: string;
  areaOfInterest: string;
}

interface ExtensionRequest {
  id: string;
  email: string;
  name: string;
  currentLimit: number;
  requested: boolean;
  requestedAt: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
}

const AdminHome: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'extensions'>('users');
  const [extensionRequests, setExtensionRequests] = useState<ExtensionRequest[]>([]);
  const [loadingExtensions, setLoadingExtensions] = useState(false);

  useEffect(() => {
    fetchAllUsers();
    fetchExtensionRequests();
  }, []);

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/skill-mint/admin/users`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 403) {
          setError(t('admin.accessDenied'));
          setTimeout(() => navigate('/login'), 2000);
          return;
        }
        throw new Error(t('admin.failedToFetch'));
      }

      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data.users);
        setTotalUsers(data.data.totalUsers);
      }
    } catch (err: any) {
      setError(err.message || t('admin.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  const fetchExtensionRequests = async () => {
    try {
      setLoadingExtensions(true);
      const response = await fetch(`${API_URL}/skill-mint/admin/job-search-extension-requests`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch extension requests');
      }

      const data = await response.json();
      
      if (data.success) {
        setExtensionRequests(data.data.requests);
      }
    } catch (err: any) {
      console.error('Error fetching extension requests:', err);
    } finally {
      setLoadingExtensions(false);
    }
  };

  const handleApproveRequest = async (userId: string) => {
    try {
      const response = await fetch(`${API_URL}/skill-mint/admin/job-search-limit/${userId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newLimit: 3,
          requestStatus: 'approved'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve request');
      }

      alert('Request approved! User limit reset to 3.');
      fetchExtensionRequests();
    } catch (err: any) {
      alert(err.message || 'Failed to approve request');
    }
  };

  const handleRejectRequest = async (userId: string) => {
    try {
      const response = await fetch(`${API_URL}/skill-mint/admin/job-search-limit/${userId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestStatus: 'rejected'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject request');
      }

      alert('Request rejected.');
      fetchExtensionRequests();
    } catch (err: any) {
      alert(err.message || 'Failed to reject request');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t('admin.neverLoggedIn');
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="p-12 text-center bg-white rounded-lg shadow-lg">
            <div className="w-16 h-16 mx-auto mb-4 border-b-2 rounded-full animate-spin border-primary-600"></div>
            <p className="text-lg text-gray-600">{t('admin.loadingUsers')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <main className="container px-4 py-8 mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">{t('admin.pageTitle')}</h1>
          <p className="text-gray-600">{t('admin.pageSubtitle')}</p>
        </div>

        {error && (
          <div className="p-4 mb-6 text-red-800 bg-red-100 border border-red-300 rounded-lg">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid gap-6 mb-8 md:grid-cols-3">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('admin.totalUsers')}</p>
                <p className="text-3xl font-bold text-primary-600">{totalUsers}</p>
              </div>
              <div className="p-3 rounded-full bg-primary-100">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Extension Requests</p>
                <p className="text-3xl font-bold text-amber-600">{extensionRequests.filter(r => r.status === 'pending').length}</p>
              </div>
              <div className="p-3 rounded-full bg-amber-100">
                <span className="text-3xl">📨</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('admin.activeUsers')}</p>
                <p className="text-3xl font-bold text-green-600">
                  {users.filter(u => u.isActive).length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('admin.inactiveUsers')}</p>
                <p className="text-3xl font-bold text-orange-600">
                  {users.filter(u => !u.isActive).length}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === 'users'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              👥 All Users ({totalUsers})
            </button>
            <button
              onClick={() => setActiveTab('extensions')}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === 'extensions'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📨 Extension Requests ({extensionRequests.filter(r => r.status === 'pending').length})
            </button>
          </div>
        </div>

        {/* Search */}
        {activeTab === 'users' && (
          <div className="mb-6">
            <input
              type="text"
              placeholder={t('admin.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-white text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        )}

        {/* Users Table */}
        {activeTab === 'users' && (
          <div className="overflow-x-auto bg-white rounded-lg shadow-md">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">{t('admin.tableHeaderUser')}</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">{t('admin.tableHeaderContact')}</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">{t('admin.tableHeaderProfile')}</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">{t('admin.tableHeaderLoginMethod')}</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">{t('admin.tableHeaderStatus')}</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">{t('admin.tableHeaderLoginCount')}</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">{t('admin.tableHeaderLastLogin')}</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">{t('admin.tableHeaderJoined')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    {t('admin.noUsersFound')}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.profilePicture ? (
                          <img src={user.profilePicture} alt={user.name} className="w-10 h-10 rounded-full" />
                        ) : (
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100">
                            <span className="font-medium text-primary-600">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{user.designation}</div>
                      <div className="text-sm text-gray-500">{user.areaOfInterest}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        user.loginMethod === 'google' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.loginMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? t('admin.statusActive') : t('admin.statusInactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                      {user.loginCount || 1}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {formatDate(user.lastLogin)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {formatDate(user.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        )}

        {/* Extension Requests Table */}
        {activeTab === 'extensions' && (
          <div className="overflow-x-auto bg-white rounded-lg shadow-md">
            {loadingExtensions ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 border-b-2 rounded-full animate-spin border-primary-600"></div>
                <p className="text-lg text-gray-600">Loading requests...</p>
              </div>
            ) : extensionRequests.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-lg text-gray-600">No extension requests found</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Current Limit</th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Requested</th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Requested At</th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Message</th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {extensionRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                        {request.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {request.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          request.currentLimit === 0 ? 'bg-red-100 text-red-800' :
                          request.currentLimit <= 1 ? 'bg-amber-100 text-amber-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {request.currentLimit} / 3
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {request.requested ? (
                          <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">✓ Yes</span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 rounded-full">✗ No</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {formatDate(request.requestedAt)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                        <div className="truncate" title={request.message}>
                          {request.message}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          request.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          request.status === 'approved' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap">
                        {request.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApproveRequest(request.id)}
                              className="px-3 py-1 text-xs font-semibold text-white transition-all bg-green-600 rounded hover:bg-green-700"
                            >
                              ✓ Approve
                            </button>
                            <button
                              onClick={() => handleRejectRequest(request.id)}
                              className="px-3 py-1 text-xs font-semibold text-white transition-all bg-red-600 rounded hover:bg-red-700"
                            >
                              ✗ Reject
                            </button>
                          </div>
                        )}
                        {request.status !== 'pending' && (
                          <span className="text-xs text-gray-500">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminHome;
