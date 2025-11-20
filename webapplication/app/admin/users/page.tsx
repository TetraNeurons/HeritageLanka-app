"use client";

import { useState, useEffect } from 'react';
import { Trash2, Users, UserCheck, MapPin, Mail, Phone, BarChart3 } from 'lucide-react';
import { AppSidebar } from '@/components/admin/Sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { User,Stats } from '@/lib/types';

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalTravelers: 0, totalGuides: 0, totalAdmins: 0 });
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(data.users || []);
      setStats(data.stats || { totalUsers: 0, totalTravelers: 0, totalGuides: 0, totalAdmins: 0 });
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    setDeleteLoading(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        const deletedUser = users.find(u => u.id === userId);
        setUsers(users.filter(u => u.id !== userId));
        setStats(prev => ({
          ...prev,
          totalUsers: prev.totalUsers - 1,
          totalTravelers: deletedUser?.role === 'TRAVELER' ? prev.totalTravelers - 1 : prev.totalTravelers,
          totalGuides: deletedUser?.role === 'GUIDE' ? prev.totalGuides - 1 : prev.totalGuides,
          totalAdmins: deletedUser?.role === 'ADMIN' ? prev.totalAdmins - 1 : prev.totalAdmins,
        }));
      } else {
        alert('Failed to delete user');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user');
    } finally {
      setDeleteLoading(null);
    }
  };

  const chartData = [
    { name: 'Travelers', value: stats.totalTravelers },
    { name: 'Guides', value: stats.totalGuides },
    { name: 'Admins', value: stats.totalAdmins },
  ];

  const barChartData = [
    { role: 'Travelers', count: stats.totalTravelers },
    { role: 'Guides', count: stats.totalGuides },
    { role: 'Admins', count: stats.totalAdmins },
  ];

  if (loading) {
    return (
      <SidebarProvider>
        <div className="flex h-screen w-full bg-gray-50">
          <AppSidebar />
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500 text-lg">Loading users...</p>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-gray-50">
        <AppSidebar />
        <div className="flex-1 overflow-y-auto">
          <header className="px-8 py-5  sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
             
            </div>
          </header>

          <div className="p-8 space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'blue' },
                { title: 'Travelers', value: stats.totalTravelers, icon: MapPin, color: 'blue' },
                { title: 'Guides', value: stats.totalGuides, icon: UserCheck, color: 'green' },
                { title: 'Admins', value: stats.totalAdmins, icon: BarChart3, color: 'orange' },
              ].map(({ title, value, icon: Icon, color }) => (
                <div key={title} className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{title}</p>
                      <p className={`text-3xl font-bold text-${color}-600 mt-2`}>{value}</p>
                    </div>
                    <div className={`p-4 bg-${color}-100 rounded-full`}>
                      <Icon className={`h-8 w-8 text-${color}-600`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="px-8 py-5 border-b bg-gray-50">
                <h2 className="text-xl font-bold text-gray-800">All Users</h2>
              </div>
              {users.length === 0 ? (
                <div className="p-20 text-center text-gray-500">No users found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        {['Name', 'Email', 'Role', 'Phone', 'Details', 'Joined', 'Actions'].map(header => (
                          <th key={header} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {users.map(user => (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{user.name}</div>
                            {user.gender && <div className="text-sm text-gray-500">{user.gender}</div>}
                          </td>
                          <td className="px-6 py-4 flex items-center gap-2 text-gray-700">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{user.email}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${
                              user.role === 'TRAVELER' ? 'bg-blue-100 text-blue-800' :
                              user.role === 'GUIDE' ? 'bg-green-100 text-green-800' :
                              'bg-orange-100 text-orange-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700 flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            {user.phone || '—'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {user.role === 'TRAVELER' && user.travelerData && <div>Country: {user.travelerData.country}</div>}
                            {user.role === 'GUIDE' && user.guideData && (
                              <div>
                                <div>Rating: {user.guideData.rating.toFixed(1)} stars</div>
                                <div>Reviews: {user.guideData.totalReviews}</div>
                              </div>
                            )}
                            {user.role === 'ADMIN' && <span className="text-gray-400">—</span>}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleDelete(user.id)}
                              disabled={deleteLoading === user.id}
                              className="text-red-600 hover:text-red-700 disabled:opacity-50 transition-colors"
                            >
                              {deleteLoading === user.id ? <span className="text-xs">Deleting...</span> : <Trash2 className="h-5 w-5" />}
                            </button>
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
    </SidebarProvider>
  );
}
