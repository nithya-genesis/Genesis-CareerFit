import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  ShieldCheck,
  Building2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  UserPlus,
  KeyRound,
  X
} from 'lucide-react';
import { getAdminUsers, createAdminUser, updateUserStatus } from '../../services/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    email: '',
    role: 'PLACEMENT_OFFICER',
    password: ''
  });

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (roleFilter !== 'ALL') params.role = roleFilter;
      if (search.trim()) params.search = search.trim();
      const res = await getAdminUsers(params);
      setUsers(res.users || []);
    } catch (err) {
      setError(err.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadUsers();
  };

  const handleToggleStatus = async (user) => {
    const currentUsername = localStorage.getItem('user_name') || '';
    if (user.username === currentUsername || user.username === 'platformadmin') {
      alert('Security Protection: An administrator cannot deactivate their own active account.');
      return;
    }
    try {
      const newStatus = !user.is_active;
      await updateUserStatus(user.id, newStatus);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_active: newStatus ? 1 : 0 } : u))
      );
    } catch (err) {
      alert(err.message || 'Failed to update user status.');
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.password.trim()) {
      setCreateError('Password is required. Please provide a secure temporary password.');
      return;
    }
    setCreateLoading(true);
    setCreateError(null);
    try {
      await createAdminUser(formData);
      setShowCreateModal(false);
      setFormData({
        username: '',
        full_name: '',
        email: '',
        role: 'PLACEMENT_OFFICER',
        password: ''
      });
      loadUsers();
    } catch (err) {
      setCreateError(err.message || 'Failed to create user.');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-900 text-[10px] font-bold uppercase tracking-wide mb-1.5">
            <Users className="w-3 h-3 text-purple-600" />
            Access & Identity
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-genesis-black tracking-tight">
            User Access Management
          </h1>
          <p className="text-xs text-zinc-600 mt-1">
            Provision, inspect, and manage authenticated users across Student, Officer, and Platform Admin roles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadUsers}
            className="p-2.5 bg-white border border-zinc-200 rounded-xl text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-all shadow-2xs"
            title="Refresh Users"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-genesis-black hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <UserPlus className="w-4 h-4 text-genesis-gold" />
            <span>Create User</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by username, full name, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 font-medium"
          />
        </form>

        <div className="flex items-center gap-2">
          {['ALL', 'PLACEMENT_OFFICER', 'PLACEMENT_ADMIN', 'STUDENT'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                roleFilter === r
                  ? 'bg-zinc-900 text-white shadow-2xs'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {r === 'ALL' ? 'All Roles' : r === 'PLACEMENT_OFFICER' ? 'Officers' : r === 'PLACEMENT_ADMIN' ? 'Admins' : 'Students'}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-zinc-500 space-y-3">
            <RefreshCw className="w-6 h-6 text-zinc-400 animate-spin mx-auto" />
            <p>Loading authenticated users...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-rose-700 space-y-2">
            <AlertCircle className="w-6 h-6 text-rose-600 mx-auto" />
            <p>{error}</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-xs text-zinc-500 space-y-2">
            <Users className="w-8 h-8 text-zinc-400 mx-auto" />
            <p className="font-bold text-zinc-700">No users found matching your criteria.</p>
            <p>Try modifying your search or filter settings.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-extrabold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-zinc-900">{u.full_name || u.username}</div>
                      <div className="text-[11px] font-mono text-zinc-500">@{u.username}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === 'PLACEMENT_ADMIN'
                            ? 'bg-purple-100 text-purple-900 border border-purple-200'
                            : u.role === 'PLACEMENT_OFFICER'
                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                            : 'bg-zinc-100 text-zinc-800 border border-zinc-200'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-600 font-mono text-[11px]">{u.email || '—'}</td>
                    <td className="py-3.5 px-4">
                      {u.is_active ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700 font-bold text-[11px]">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          Deactivated
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-500 text-[11px]">
                      {u.created_at ? u.created_at.split('T')[0] : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                          u.is_active
                            ? 'border-zinc-200 text-rose-700 hover:bg-rose-50 hover:border-rose-300'
                            : 'border-zinc-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300'
                        }`}
                      >
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-genesis-gold" />
                <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">Provision New User</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-zinc-400 hover:text-zinc-900 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {createError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 mb-1">Username *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. tpo_cse"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg font-mono focus:bg-white focus:border-zinc-900"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prof. Ramesh Kumar"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:border-zinc-900"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. ramesh@genesis.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:border-zinc-900"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Role Type *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg font-bold text-zinc-900 focus:bg-white focus:border-zinc-900"
                >
                  <option value="PLACEMENT_OFFICER">Placement Officer (TPO)</option>
                  <option value="PLACEMENT_ADMIN">Placement Administrator</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Initial Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Enter secure temporary password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg font-mono focus:bg-white focus:border-zinc-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-zinc-200 text-zinc-700 font-bold rounded-lg hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-4 py-2 bg-genesis-black text-white font-bold rounded-lg hover:bg-zinc-800 disabled:opacity-50"
                >
                  {createLoading ? 'Provisioning...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
