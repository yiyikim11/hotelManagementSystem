import { useState } from 'react';
import { Plus, Wrench, AlertTriangle, Edit2, Trash2 } from 'lucide-react';
import { dataStore } from '../../data/store';
import { MaintenanceRequest } from '../../types';
import FormModal from '../shared/FormModal';

export default function HousekeepingMaintenance() {
  const [requests, setRequests] = useState(dataStore.getMaintenanceRequests());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRequest, setEditingRequest] = useState<MaintenanceRequest | null>(null);
  const [formData, setFormData] = useState({
    roomNumber: '',
    issue: '',
    description: '',
    priority: 'medium',
    assignedTo: '',
    expectedCompletion: ''
  });

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'low': 'bg-gray-100 text-gray-700',
      'medium': 'bg-yellow-100 text-yellow-700',
      'high': 'bg-orange-100 text-orange-700',
      'urgent': 'bg-red-100 text-red-700'
    };
    return colors[priority] || 'bg-gray-100 text-gray-700';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'open': 'bg-red-100 text-red-700',
      'in-progress': 'bg-blue-100 text-blue-700',
      'completed': 'bg-green-100 text-green-700',
      'cancelled': 'bg-gray-100 text-gray-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const handleSubmit = () => {
    const newRequest: MaintenanceRequest = {
      id: `MR${String(requests.length + 1).padStart(3, '0')}`,
      roomNumber: formData.roomNumber,
      issue: formData.issue,
      description: formData.description,
      priority: formData.priority as MaintenanceRequest['priority'],
      status: 'open',
      reportedBy: 'Front Desk',
      reportedAt: new Date().toISOString(),
      assignedTo: formData.assignedTo || undefined,
      expectedCompletion: formData.expectedCompletion || undefined
    };

    setRequests([...requests, newRequest]);
    dataStore.maintenanceRequests.push(newRequest);
    setShowAddModal(false);
    setFormData({
      roomNumber: '',
      issue: '',
      description: '',
      priority: 'medium',
      assignedTo: '',
      expectedCompletion: ''
    });
  };

  const updateRequestStatus = (requestId: string, newStatus: MaintenanceRequest['status']) => {
    const updatedRequests = requests.map(r =>
      r.id === requestId ? {
        ...r,
        status: newStatus,
        completedAt: newStatus === 'completed' ? new Date().toISOString() : r.completedAt
      } : r
    );
    setRequests(updatedRequests);

    const requestIndex = dataStore.maintenanceRequests.findIndex(r => r.id === requestId);
    if (requestIndex !== -1) {
      dataStore.maintenanceRequests[requestIndex].status = newStatus;
      if (newStatus === 'completed') {
        dataStore.maintenanceRequests[requestIndex].completedAt = new Date().toISOString();
      }
    }
  };

  const handleEdit = (request: MaintenanceRequest) => {
    setEditingRequest(request);
    setFormData({
      roomNumber: request.roomNumber,
      issue: request.issue,
      description: request.description,
      priority: request.priority,
      assignedTo: request.assignedTo || '',
      expectedCompletion: request.expectedCompletion || ''
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = () => {
    if (!editingRequest) return;

    const updatedRequests = requests.map(r =>
      r.id === editingRequest.id ? {
        ...r,
        roomNumber: formData.roomNumber,
        issue: formData.issue,
        description: formData.description,
        priority: formData.priority as MaintenanceRequest['priority'],
        assignedTo: formData.assignedTo || undefined,
        expectedCompletion: formData.expectedCompletion || undefined
      } : r
    );
    setRequests(updatedRequests);

    const requestIndex = dataStore.maintenanceRequests.findIndex(r => r.id === editingRequest.id);
    if (requestIndex !== -1) {
      dataStore.maintenanceRequests[requestIndex] = {
        ...dataStore.maintenanceRequests[requestIndex],
        roomNumber: formData.roomNumber,
        issue: formData.issue,
        description: formData.description,
        priority: formData.priority as MaintenanceRequest['priority'],
        assignedTo: formData.assignedTo || undefined,
        expectedCompletion: formData.expectedCompletion || undefined
      };
    }

    setShowEditModal(false);
    setEditingRequest(null);
  };

  const handleDelete = (requestId: string) => {
    if (!confirm('Are you sure you want to delete this maintenance request?')) return;

    const updatedRequests = requests.filter(r => r.id !== requestId);
    setRequests(updatedRequests);

    const requestIndex = dataStore.maintenanceRequests.findIndex(r => r.id === requestId);
    if (requestIndex !== -1) {
      dataStore.maintenanceRequests.splice(requestIndex, 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 ">Maintenance & Repairs</h1>
          <p className="text-gray-600  mt-1">Track maintenance work orders and out-of-order rooms</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Create Request
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white  rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="bg-red-500 p-3 rounded-lg">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 ">Open Requests</p>
              <p className="text-2xl font-bold text-gray-900 ">
                {requests.filter(r => r.status === 'open').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white  rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-3 rounded-lg">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 ">In Progress</p>
              <p className="text-2xl font-bold text-gray-900 ">
                {requests.filter(r => r.status === 'in-progress').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white  rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 ">Urgent</p>
              <p className="text-2xl font-bold text-gray-900 ">
                {requests.filter(r => r.priority === 'urgent').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white  rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-500 p-3 rounded-lg">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 ">Completed</p>
              <p className="text-2xl font-bold text-gray-900 ">
                {requests.filter(r => r.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Request ID</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Room</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Issue</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Assigned To</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Reported</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Expected</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {requests.map((request) => (
              <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                  {request.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  {request.roomNumber}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                  {request.issue}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${getPriorityColor(request.priority)}`}>
                    {request.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {request.assignedTo || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {new Date(request.reportedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {request.expectedCompletion ? new Date(request.expectedCompletion).toLocaleDateString() : '-'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {request.status === 'open' && (
                      <button
                        onClick={() => updateRequestStatus(request.id, 'in-progress')}
                        className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100 border border-blue-200 transition-colors"
                      >
                        Start
                      </button>
                    )}
                    {request.status === 'in-progress' && (
                      <button
                        onClick={() => updateRequestStatus(request.id, 'completed')}
                        className="px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded hover:bg-green-100 border border-green-200 transition-colors"
                      >
                        Complete
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(request)}
                      className="p-2 text-gray-700 hover:text-blue-700 hover:bg-blue-50 rounded border border-gray-300 hover:border-blue-300 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(request.id)}
                      className="p-2 text-gray-700 hover:text-red-700 hover:bg-red-50 rounded border border-gray-300 hover:border-red-300 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Maintenance Request Modal */}
      <FormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleSubmit}
        title="Create Maintenance Request"
        submitText="Create Request"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700  mb-2">Room Number *</label>
            <input
              type="text"
              value={formData.roomNumber}
              onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
              placeholder="e.g., 101"
              className="w-full px-4 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700  mb-2">Issue Summary *</label>
            <input
              type="text"
              value={formData.issue}
              onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
              placeholder="e.g., AC not working"
              className="w-full px-4 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700  mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of the issue..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700  mb-2">Priority *</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700  mb-2">Assign To</label>
            <input
              type="text"
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              placeholder="Technician name (optional)"
              className="w-full px-4 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700  mb-2">Expected Completion</label>
            <input
              type="date"
              value={formData.expectedCompletion}
              onChange={(e) => setFormData({ ...formData, expectedCompletion: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </FormModal>

      {/* Edit Maintenance Request Modal */}
      <FormModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingRequest(null);
        }}
        onSubmit={handleEditSubmit}
        title={`Edit Request ${editingRequest?.id}`}
        submitText="Update Request"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Room Number *</label>
            <input
              type="text"
              value={formData.roomNumber}
              onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
              placeholder="e.g., 101"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Issue Summary *</label>
            <input
              type="text"
              value={formData.issue}
              onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
              placeholder="e.g., AC not working"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of the issue..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
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
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assign To</label>
            <input
              type="text"
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              placeholder="Technician name (optional)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Expected Completion</label>
            <input
              type="date"
              value={formData.expectedCompletion}
              onChange={(e) => setFormData({ ...formData, expectedCompletion: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </FormModal>
    </div>
  );
}
