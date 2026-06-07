import { useState } from 'react';
import { Plus, CheckCircle2, Clock, Play, Edit2, Trash2, Search } from 'lucide-react';
import { dataStore } from '../../data/store';
import { HousekeepingTask } from '../../types';
import FormModal from '../shared/FormModal';
import { useAuth } from '../../context/AuthContext';

export default function HousekeepingTasks() {
  const [tasks, setTasks] = useState(dataStore.getHousekeepingTasks());
  const [users] = useState(dataStore.getUsers());
  const { user } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState<HousekeepingTask | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [formData, setFormData] = useState({
    roomNumber: '',
    type: '',
    assignedTo: '',
    priority: 'medium',
    scheduledFor: new Date().toISOString(),
    notes: ''
  });

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'low': 'bg-gray-100 text-gray-700',
      'medium': 'bg-yellow-100 text-yellow-700',
      'high': 'bg-red-100 text-red-700'
    };
    return colors[priority] || 'bg-gray-100 text-gray-700';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-700',
      'in-progress': 'bg-blue-100 text-blue-700',
      'completed': 'bg-green-100 text-green-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'departure': 'bg-red-100 text-red-700',
      'stayover': 'bg-blue-100 text-blue-700',
      'turndown': 'bg-purple-100 text-purple-700',
      'deep-clean': 'bg-orange-100 text-orange-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const filteredTasks = tasks.filter(task => {
    const taskUser = users.find(u => u.id === task.assignedTo);
    const matchesSearch = !searchTerm ||
      task.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      taskUser?.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  const handleSubmit = () => {
    const newTask: HousekeepingTask = {
      id: `HT${String(tasks.length + 1).padStart(3, '0')}`,
      roomNumber: formData.roomNumber,
      type: formData.type as HousekeepingTask['type'],
      assignedTo: formData.assignedTo,
      priority: formData.priority as HousekeepingTask['priority'],
      status: 'pending',
      scheduledFor: formData.scheduledFor,
      notes: formData.notes || undefined
    };

    setTasks([...tasks, newTask]);
    dataStore.housekeepingTasks.push(newTask);
    setShowAddModal(false);
    setFormData({
      roomNumber: '',
      type: '',
      assignedTo: '',
      priority: 'medium',
      scheduledFor: new Date().toISOString(),
      notes: ''
    });
  };

  const startTask = (taskId: string) => {
    const updatedTasks = tasks.map(t =>
      t.id === taskId ? { ...t, status: 'in-progress' as HousekeepingTask['status'] } : t
    );
    setTasks(updatedTasks);

    const taskIndex = dataStore.housekeepingTasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      dataStore.housekeepingTasks[taskIndex].status = 'in-progress';
    }
  };

  const completeTask = (taskId: string) => {
    const updatedTasks = tasks.map(t =>
      t.id === taskId ? {
        ...t,
        status: 'completed' as HousekeepingTask['status'],
        completedAt: new Date().toISOString()
      } : t
    );
    setTasks(updatedTasks);

    const taskIndex = dataStore.housekeepingTasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      dataStore.housekeepingTasks[taskIndex].status = 'completed';
      dataStore.housekeepingTasks[taskIndex].completedAt = new Date().toISOString();
    }
  };

  const handleEdit = (task: HousekeepingTask) => {
    setEditingTask(task);
    setFormData({
      roomNumber: task.roomNumber,
      type: task.type,
      assignedTo: task.assignedTo,
      priority: task.priority,
      scheduledFor: task.scheduledFor,
      notes: task.notes || ''
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = () => {
    if (!editingTask) return;

    const updatedTasks = tasks.map(t =>
      t.id === editingTask.id ? {
        ...t,
        roomNumber: formData.roomNumber,
        type: formData.type as HousekeepingTask['type'],
        assignedTo: formData.assignedTo,
        priority: formData.priority as HousekeepingTask['priority'],
        scheduledFor: formData.scheduledFor,
        notes: formData.notes || undefined
      } : t
    );
    setTasks(updatedTasks);

    const taskIndex = dataStore.housekeepingTasks.findIndex(t => t.id === editingTask.id);
    if (taskIndex !== -1) {
      dataStore.housekeepingTasks[taskIndex] = {
        ...dataStore.housekeepingTasks[taskIndex],
        roomNumber: formData.roomNumber,
        type: formData.type as HousekeepingTask['type'],
        assignedTo: formData.assignedTo,
        priority: formData.priority as HousekeepingTask['priority'],
        scheduledFor: formData.scheduledFor,
        notes: formData.notes || undefined
      };
    }

    setShowEditModal(false);
    setEditingTask(null);
  };

  const handleDelete = (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    const updatedTasks = tasks.filter(t => t.id !== taskId);
    setTasks(updatedTasks);

    const taskIndex = dataStore.housekeepingTasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      dataStore.housekeepingTasks.splice(taskIndex, 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Housekeeping Tasks</h1>
          <p className="text-gray-600 mt-1">Assign and track cleaning tasks</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Create Task
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{pendingTasks.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{inProgressTasks.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-500 p-3 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed Today</p>
              <p className="text-2xl font-bold text-gray-900">{completedTasks.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by room number, task ID, or staff name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredTasks.map((task) => {
              const taskUser = users.find(u => u.id === task.assignedTo);
              return (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {task.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Room {task.roomNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(task.type)}`}>
                      {task.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {taskUser?.fullName || task.assignedTo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(task.scheduledFor).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      {task.status === 'pending' && (
                        <button
                          onClick={() => startTask(task.id)}
                          className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                          title="Start task"
                        >
                          <Play className="w-4 h-4" />
                          Start
                        </button>
                      )}
                      {task.status === 'in-progress' && (
                        <button
                          onClick={() => completeTask(task.id)}
                          className="text-green-600 hover:text-green-800 inline-flex items-center gap-1"
                          title="Complete task"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Complete
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(task)}
                        className="text-gray-600 hover:text-gray-800 inline-flex items-center gap-1"
                        title="Edit task"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="text-red-600 hover:text-red-800 inline-flex items-center gap-1"
                        title="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Create Task Modal */}
      <FormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleSubmit}
        title="Create Housekeeping Task"
        submitText="Create Task"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Room Number *</label>
            <input
              type="text"
              value={formData.roomNumber}
              onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
              placeholder="101"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Task Type *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select type...</option>
              <option value="departure">Departure Clean</option>
              <option value="stayover">Stayover</option>
              <option value="turndown">Turndown Service</option>
              <option value="deep-clean">Deep Clean</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assign To *</label>
            <select
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select staff...</option>
              {users.filter(u => u.department === 'Housekeeping' || u.role === 'admin').map(u => (
                <option key={u.id} value={u.id}>{u.fullName} - {u.department}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority *</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled For *</label>
            <input
              type="datetime-local"
              value={formData.scheduledFor.slice(0, 16)}
              onChange={(e) => setFormData({ ...formData, scheduledFor: new Date(e.target.value).toISOString() })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Special instructions..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </FormModal>

      {/* Edit Task Modal */}
      <FormModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingTask(null);
        }}
        onSubmit={handleEditSubmit}
        title={`Edit Task ${editingTask?.id}`}
        submitText="Update Task"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Room Number *</label>
            <input
              type="text"
              value={formData.roomNumber}
              onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
              placeholder="101"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Task Type *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select type...</option>
              <option value="departure">Departure Clean</option>
              <option value="stayover">Stayover</option>
              <option value="turndown">Turndown Service</option>
              <option value="deep-clean">Deep Clean</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assign To *</label>
            <select
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select staff...</option>
              {users.filter(u => u.department === 'Housekeeping' || u.role === 'admin').map(u => (
                <option key={u.id} value={u.id}>{u.fullName} - {u.department}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority *</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled For *</label>
            <input
              type="datetime-local"
              value={formData.scheduledFor.slice(0, 16)}
              onChange={(e) => setFormData({ ...formData, scheduledFor: new Date(e.target.value).toISOString() })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Special instructions..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </FormModal>
    </div>
  );
}
