import { useState, useEffect, useCallback } from 'react';
import { Plus, Shield, User, Search, Edit2, CheckCircle, XCircle } from 'lucide-react';
import { usersApi, type UserResponse, type CreateUserRequest } from '../../services/pms/usersApi';
import { rolesApi, type RoleResponse } from '../../services/pms/rolesApi';
import FormModal from '../shared/FormModal';

const emptyAddForm: CreateUserRequest & { isActive: boolean } = {
  username: '',
  fullName: '',
  email: '',
  password: '',
  roleId: '',
  department: '',
  isActive: true,
};

export default function PMSUsers() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [addForm, setAddForm] = useState(emptyAddForm);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [usersPage, rolesList] = await Promise.all([usersApi.list(), rolesApi.list()]);
      setUsers(usersPage.content);
      setRoles(rolesList);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filteredUsers = users.filter(u =>
    !searchTerm ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role: string | null) => {
    const lower = (role ?? '').toLowerCase();
    if (lower.includes('admin')) return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
    if (lower.includes('manager')) return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
    return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
  };

  const handleAddSubmit = async () => {
    if (!addForm.username || !addForm.fullName || !addForm.email || !addForm.password) return;
    try {
      await usersApi.create({
        username: addForm.username,
        fullName: addForm.fullName,
        email: addForm.email,
        password: addForm.password,
        roleId: addForm.roleId || undefined,
        department: addForm.department || undefined,
      });
      setAddForm(emptyAddForm);
      setShowAddModal(false);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create user');
    }
  };

  const handleToggleActive = async (u: UserResponse) => {
    try {
      if (u.isActive) {
        await usersApi.deactivate(u.id);
      } else {
        await usersApi.activate(u.id);
      }
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update user status');
    }
  };

  const handleEditOpen = (u: UserResponse) => {
    setEditingUser(u);
    setShowEditModal(true);
  };

  const roleDistribution = roles.map(r => ({
    name: r.name,
    count: users.filter(u => u.role === r.name).length,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User & Access Management</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Manage user accounts and access levels</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Add User
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      {/* Search */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-zinc-500" />
          <input
            type="text"
            placeholder="Search by username, name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Users Grid */}
      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((u) => {
            const RoleIcon = (u.role ?? '').toLowerCase().includes('admin') ? Shield : User;
            return (
              <div key={u.id} className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-full ${getRoleColor(u.role).replace(/text-\S+/g, '')} bg-opacity-20`}>
                      <RoleIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{u.fullName}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">@{u.username}</p>
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full mt-1 ${u.isActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-zinc-600'}`} title={u.isActive ? 'Active' : 'Inactive'} />
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Email:</span>
                    <span className="text-gray-900 dark:text-white truncate ml-2">{u.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Role:</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getRoleColor(u.role)}`}>{u.role ?? '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Department:</span>
                    <span className="text-gray-900 dark:text-white">{u.department ?? '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Status:</span>
                    <span className={`text-sm ${u.isActive ? 'text-green-600' : 'text-gray-500 dark:text-zinc-400'}`}>{u.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-zinc-700">
                  <button
                    onClick={() => handleEditOpen(u)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Edit2 className="w-4 h-4" />
                    Details
                  </button>
                  <button
                    onClick={() => handleToggleActive(u)}
                    className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm rounded-lg ${u.isActive ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                  >
                    {u.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    {u.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Role Summary */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Role Distribution</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {roleDistribution.map(({ name, count }) => (
            <div key={name} className="p-4 bg-gray-50 dark:bg-zinc-700/40 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">{name}</span>
                <span className={`px-3 py-1 rounded-full font-medium ${getRoleColor(name)}`}>{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add User Modal */}
      <FormModal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setAddForm(emptyAddForm); }}
        onSubmit={handleAddSubmit}
        title="Add New User"
        submitText="Create User"
        size="md"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Full Name *</label>
            <input
              type="text"
              value={addForm.fullName}
              onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })}
              placeholder="Jane Smith"
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Username *</label>
            <input
              type="text"
              value={addForm.username}
              onChange={(e) => setAddForm({ ...addForm, username: e.target.value })}
              placeholder="jsmith"
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Email *</label>
            <input
              type="email"
              value={addForm.email}
              onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
              placeholder="jane@hotel.com"
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Password *</label>
            <input
              type="password"
              value={addForm.password}
              onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
              placeholder="••••••••"
              autoComplete="new-password"
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Role</label>
            <select
              value={addForm.roleId}
              onChange={(e) => setAddForm({ ...addForm, roleId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">No role</option>
              {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Department</label>
            <select
              value={addForm.department}
              onChange={(e) => setAddForm({ ...addForm, department: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select department…</option>
              <option value="Front Office">Front Office</option>
              <option value="Housekeeping">Housekeeping</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Administration">Administration</option>
              <option value="Management">Management</option>
            </select>
          </div>
        </div>
      </FormModal>

      {/* User Details Modal (read-only; activate/deactivate via card button) */}
      {editingUser && (
        <FormModal
          isOpen={showEditModal}
          onClose={() => { setShowEditModal(false); setEditingUser(null); }}
          onSubmit={() => { setShowEditModal(false); setEditingUser(null); }}
          title={`User — ${editingUser.fullName}`}
          submitText="Close"
          size="md"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {[
              ['Username', editingUser.username],
              ['Full Name', editingUser.fullName],
              ['Email', editingUser.email],
              ['Role', editingUser.role ?? '—'],
              ['Department', editingUser.department ?? '—'],
              ['Status', editingUser.isActive ? 'Active' : 'Inactive'],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-gray-500 dark:text-gray-400">{label}</p>
                <p className="font-medium text-gray-900 dark:text-white mt-0.5">{value}</p>
              </div>
            ))}
            <div className="md:col-span-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-700 dark:text-blue-300 text-xs">
              To change username, email, or role, please use the backend admin API directly. The frontend only supports creating users and toggling active status.
            </div>
          </div>
        </FormModal>
      )}
    </div>
  );
}
