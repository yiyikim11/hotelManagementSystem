import { useState } from 'react';
import { Plus, Shield, User, Search, Edit2, Key, CheckSquare, Square } from 'lucide-react';
import { dataStore } from '../../data/store';
import type { User as UserType } from '../../types';
import FormModal from '../shared/FormModal';
import Modal from '../shared/Modal';

const ALL_PERMISSIONS = [
  { id: 'reservations.view', label: 'View Reservations', module: 'PMS' },
  { id: 'reservations.create', label: 'Create Reservations', module: 'PMS' },
  { id: 'reservations.edit', label: 'Edit Reservations', module: 'PMS' },
  { id: 'reservations.delete', label: 'Delete Reservations', module: 'PMS' },
  { id: 'charges.view', label: 'View Charges', module: 'PMS' },
  { id: 'charges.create', label: 'Create Charges', module: 'PMS' },
  { id: 'guests.view', label: 'View Guests', module: 'PMS' },
  { id: 'guests.edit', label: 'Edit Guests', module: 'PMS' },
  { id: 'frontoffice.checkin', label: 'Process Check-In', module: 'Front Office' },
  { id: 'frontoffice.checkout', label: 'Process Check-Out', module: 'Front Office' },
  { id: 'frontoffice.cancellation', label: 'Process Cancellations', module: 'Front Office' },
  { id: 'housekeeping.view', label: 'View Housekeeping', module: 'Housekeeping' },
  { id: 'housekeeping.update', label: 'Update Room Status', module: 'Housekeeping' },
  { id: 'housekeeping.maintenance', label: 'Manage Maintenance', module: 'Housekeeping' },
  { id: 'restaurant.view', label: 'View Restaurant', module: 'Restaurant' },
  { id: 'restaurant.orders', label: 'Manage Orders', module: 'Restaurant' },
  { id: 'inventory.view', label: 'View Inventory', module: 'Inventory' },
  { id: 'inventory.edit', label: 'Edit Inventory', module: 'Inventory' },
  { id: 'reports.view', label: 'View Reports', module: 'Reports' },
  { id: 'users.manage', label: 'Manage Users', module: 'Administration' },
];

const DEFAULT_PERMISSIONS: Record<string, string[]> = {
  admin: ALL_PERMISSIONS.map(p => p.id),
  manager: ALL_PERMISSIONS.filter(p => p.module !== 'Administration').map(p => p.id),
  staff: ['reservations.view', 'charges.view', 'guests.view', 'frontoffice.checkin', 'frontoffice.checkout', 'housekeeping.view', 'housekeeping.update', 'restaurant.view', 'restaurant.orders', 'inventory.view'],
};

export default function PMSUsers() {
  const [users, setUsers] = useState(dataStore.getUsers());
  const [userPermissions, setUserPermissions] = useState<Record<string, string[]>>(
    () => Object.fromEntries(users.map(u => [u.id, DEFAULT_PERMISSIONS[u.role] || []]))
  );
  const [searchTerm, setSearchTerm] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [permissionsUser, setPermissionsUser] = useState<UserType | null>(null);

  const emptyForm = { username: '', fullName: '', email: '', role: 'staff' as UserType['role'], department: '', password: '', isActive: true };
  const [addForm, setAddForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState({ username: '', fullName: '', email: '', role: 'staff' as UserType['role'], department: '', isActive: true });
  const [editedPermissions, setEditedPermissions] = useState<string[]>([]);

  const filteredUsers = users.filter(u =>
    !searchTerm ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
      manager: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      staff: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    };
    return colors[role] || 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-200';
  };

  const handleAddSubmit = () => {
    if (!addForm.username || !addForm.fullName || !addForm.email) return;
    const newUser: UserType = {
      id: `U${String(users.length + 1).padStart(3, '0')}`,
      username: addForm.username,
      fullName: addForm.fullName,
      email: addForm.email,
      role: addForm.role,
      department: addForm.department,
      isActive: addForm.isActive,
      createdAt: new Date().toISOString(),
    };
    setUsers([...users, newUser]);
    dataStore.users.push(newUser);
    setUserPermissions(prev => ({ ...prev, [newUser.id]: DEFAULT_PERMISSIONS[newUser.role] || [] }));
    setAddForm(emptyForm);
    setShowAddModal(false);
  };

  const handleEditOpen = (user: UserType) => {
    setEditingUser(user);
    setEditForm({ username: user.username, fullName: user.fullName, email: user.email, role: user.role, department: user.department, isActive: user.isActive });
    setShowEditModal(true);
  };

  const handleEditSubmit = () => {
    if (!editingUser) return;
    const updated = users.map(u => u.id === editingUser.id ? { ...u, ...editForm } : u);
    setUsers(updated);
    const idx = dataStore.users.findIndex(u => u.id === editingUser.id);
    if (idx !== -1) Object.assign(dataStore.users[idx], editForm);
    setShowEditModal(false);
    setEditingUser(null);
  };

  const handlePermissionsOpen = (user: UserType) => {
    setPermissionsUser(user);
    setEditedPermissions(userPermissions[user.id] || DEFAULT_PERMISSIONS[user.role] || []);
    setShowPermissionsModal(true);
  };

  const handlePermissionsSave = () => {
    if (!permissionsUser) return;
    setUserPermissions(prev => ({ ...prev, [permissionsUser.id]: editedPermissions }));
    setShowPermissionsModal(false);
    setPermissionsUser(null);
  };

  const togglePermission = (permId: string) => {
    setEditedPermissions(prev =>
      prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
    );
  };

  const toggleModule = (module: string, checked: boolean) => {
    const modulePerms = ALL_PERMISSIONS.filter(p => p.module === module).map(p => p.id);
    if (checked) {
      setEditedPermissions(prev => [...new Set([...prev, ...modulePerms])]);
    } else {
      setEditedPermissions(prev => prev.filter(p => !modulePerms.includes(p)));
    }
  };

  const modules = [...new Set(ALL_PERMISSIONS.map(p => p.module))];

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((u) => {
          const RoleIcon = u.role === 'admin' ? Shield : User;
          const permCount = (userPermissions[u.id] || DEFAULT_PERMISSIONS[u.role] || []).length;
          return (
            <div key={u.id} className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-full ${u.role === 'admin' ? 'bg-purple-100 dark:bg-purple-900/30' : u.role === 'manager' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
                    <RoleIcon className={`w-6 h-6 ${u.role === 'admin' ? 'text-purple-600' : u.role === 'manager' ? 'text-blue-600' : 'text-green-600'}`} />
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
                  <span className={`px-2 py-0.5 rounded-full text-xs ${getRoleColor(u.role)}`}>{u.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Department:</span>
                  <span className="text-gray-900 dark:text-white">{u.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Status:</span>
                  <span className={`text-sm ${u.isActive ? 'text-green-600' : 'text-gray-500 dark:text-zinc-400'}`}>{u.isActive ? 'Active' : 'Inactive'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Permissions:</span>
                  <span className="text-gray-900 dark:text-white">{permCount} granted</span>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-zinc-700">
                <button
                  onClick={() => handleEditOpen(u)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handlePermissionsOpen(u)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-gray-200 dark:bg-zinc-700 text-gray-800 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:bg-zinc-600"
                >
                  <Key className="w-4 h-4" />
                  Permissions
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Role Summary */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Role Distribution</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['admin', 'manager', 'staff'].map((role) => {
            const count = users.filter(u => u.role === role).length;
            return (
              <div key={role} className="p-4 bg-gray-50 dark:bg-zinc-700/40 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-300 capitalize">{role}</span>
                  <span className={`px-3 py-1 rounded-full font-medium ${getRoleColor(role)}`}>{count}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add User Modal */}
      <FormModal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setAddForm(emptyForm); }}
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
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Role *</label>
            <select
              value={addForm.role}
              onChange={(e) => setAddForm({ ...addForm, role: e.target.value as UserType['role'] })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Department *</label>
            <select
              value={addForm.department}
              onChange={(e) => setAddForm({ ...addForm, department: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select department...</option>
              <option value="Front Office">Front Office</option>
              <option value="Housekeeping">Housekeeping</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Administration">Administration</option>
              <option value="Management">Management</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={addForm.isActive}
                onChange={(e) => setAddForm({ ...addForm, isActive: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Account Active</span>
            </label>
          </div>
        </div>
      </FormModal>

      {/* Edit User Modal */}
      <FormModal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setEditingUser(null); }}
        onSubmit={handleEditSubmit}
        title={`Edit User — ${editingUser?.fullName}`}
        submitText="Save Changes"
        size="md"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Full Name *</label>
            <input
              type="text"
              value={editForm.fullName}
              onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Username *</label>
            <input
              type="text"
              value={editForm.username}
              onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Email *</label>
            <input
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Role *</label>
            <select
              value={editForm.role}
              onChange={(e) => setEditForm({ ...editForm, role: e.target.value as UserType['role'] })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Department *</label>
            <select
              value={editForm.department}
              onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select department...</option>
              <option value="Front Office">Front Office</option>
              <option value="Housekeeping">Housekeeping</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Administration">Administration</option>
              <option value="Management">Management</option>
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-3 cursor-pointer pb-2">
              <input
                type="checkbox"
                checked={editForm.isActive}
                onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Account Active</span>
            </label>
          </div>
        </div>
      </FormModal>

      {/* Permissions Modal */}
      {permissionsUser && (
        <Modal
          isOpen={showPermissionsModal}
          onClose={() => { setShowPermissionsModal(false); setPermissionsUser(null); }}
          title={`Permissions — ${permissionsUser.fullName}`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-700/40 rounded-lg">
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Role: </span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${getRoleColor(permissionsUser.role)}`}>
                  {permissionsUser.role}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditedPermissions(ALL_PERMISSIONS.map(p => p.id))}
                  className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Grant All
                </button>
                <button
                  onClick={() => setEditedPermissions([])}
                  className="text-xs px-3 py-1 bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:bg-zinc-600"
                >
                  Revoke All
                </button>
                <button
                  onClick={() => setEditedPermissions(DEFAULT_PERMISSIONS[permissionsUser.role] || [])}
                  className="text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Reset to Role Default
                </button>
              </div>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              {modules.map((module) => {
                const modulePerms = ALL_PERMISSIONS.filter(p => p.module === module);
                const allChecked = modulePerms.every(p => editedPermissions.includes(p.id));
                const someChecked = modulePerms.some(p => editedPermissions.includes(p.id));
                return (
                  <div key={module} className="border border-gray-200 dark:border-zinc-700 rounded-lg overflow-hidden">
                    <div
                      className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-zinc-700/40 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-700"
                      onClick={() => toggleModule(module, !allChecked)}
                    >
                      {allChecked ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : someChecked ? (
                        <CheckSquare className="w-4 h-4 text-blue-300" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400 dark:text-zinc-500" />
                      )}
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{module}</span>
                      <span className="ml-auto text-xs text-gray-500 dark:text-zinc-400">
                        {modulePerms.filter(p => editedPermissions.includes(p.id)).length}/{modulePerms.length}
                      </span>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-zinc-700">
                      {modulePerms.map((perm) => {
                        const checked = editedPermissions.includes(perm.id);
                        return (
                          <label
                            key={perm.id}
                            className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-blue-50 dark:bg-blue-900/20"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => togglePermission(perm.id)}
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-200">{perm.label}</span>
                            <span className="ml-auto text-xs text-gray-400 dark:text-zinc-500 font-mono">{perm.id}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-zinc-700">
              <button
                onClick={() => { setShowPermissionsModal(false); setPermissionsUser(null); }}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-zinc-700 text-gray-800 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:bg-zinc-600"
              >
                Cancel
              </button>
              <button
                onClick={handlePermissionsSave}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Permissions
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
