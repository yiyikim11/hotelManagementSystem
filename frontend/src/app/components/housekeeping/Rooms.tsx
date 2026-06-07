import { useState } from 'react';
import { Search, Filter, ClipboardCheck, UserPlus, Wrench, Eye, Building2 } from 'lucide-react';
import { dataStore } from '../../data/store';
import FormModal from '../shared/FormModal';
import { RoomStatus } from '../../types';
import { toast } from 'sonner';

export default function HousekeepingRooms() {
  const [roomStatuses, setRoomStatuses] = useState(dataStore.getRoomStatuses());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFloor, setFilterFloor] = useState<string>('all');
  const [filterCleaningStatus, setFilterCleaningStatus] = useState<string>('all');
  const [filterOccupancy, setFilterOccupancy] = useState<string>('all');

  // Modals
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<RoomStatus | null>(null);

  // Form data
  const [statusUpdate, setStatusUpdate] = useState({ cleaningStatus: '', notes: '' });
  const [assignData, setAssignData] = useState({ assignedTo: '' });
  const [maintenanceData, setMaintenanceData] = useState({ issue: '', priority: 'medium' });

  // Available staff (from dataStore users)
  const housekeepingStaff = dataStore.getUsers().filter(u =>
    u.department === 'Housekeeping' || u.role === 'staff'
  );

  const filteredRooms = roomStatuses.filter(room => {
    const matchesSearch = !searchTerm ||
      room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFloor = filterFloor === 'all' || room.floor.toString() === filterFloor;
    const matchesCleaningStatus = filterCleaningStatus === 'all' || room.cleaningStatus === filterCleaningStatus;
    const matchesOccupancy = filterOccupancy === 'all' || room.occupancyStatus === filterOccupancy;

    return matchesSearch && matchesFloor && matchesCleaningStatus && matchesOccupancy;
  });

  const floors = [...new Set(roomStatuses.map(r => r.floor))].sort((a, b) => a - b);

  // Stats
  const stats = {
    total: roomStatuses.length,
    dirty: roomStatuses.filter(r => r.cleaningStatus === 'dirty').length,
    clean: roomStatuses.filter(r => r.cleaningStatus === 'clean').length,
    ready: roomStatuses.filter(r => r.cleaningStatus === 'ready').length,
    outOfOrder: roomStatuses.filter(r => r.cleaningStatus === 'out-of-order' || r.cleaningStatus === 'out-of-service').length,
    occupied: roomStatuses.filter(r => r.occupancyStatus === 'occupied').length,
  };

  const getCleaningStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'dirty': 'bg-red-100 text-red-700',
      'clean': 'bg-blue-100 text-blue-700',
      'inspected': 'bg-purple-100 text-purple-700',
      'ready': 'bg-green-100 text-green-700',
      'out-of-order': 'bg-orange-100 text-orange-700',
      'out-of-service': 'bg-gray-100 text-gray-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getOccupancyColor = (status: string) => {
    const colors: Record<string, string> = {
      'vacant': 'bg-green-100 text-green-700',
      'occupied': 'bg-blue-100 text-blue-700',
      'reserved': 'bg-yellow-100 text-yellow-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  // Actions
  const handleOpenStatusModal = (room: RoomStatus) => {
    setSelectedRoom(room);
    setStatusUpdate({ cleaningStatus: room.cleaningStatus, notes: room.notes || '' });
    setShowStatusModal(true);
  };

  const handleOpenAssignModal = (room: RoomStatus) => {
    setSelectedRoom(room);
    setAssignData({ assignedTo: room.assignedTo || '' });
    setShowAssignModal(true);
  };

  const handleOpenMaintenanceModal = (room: RoomStatus) => {
    setSelectedRoom(room);
    setMaintenanceData({ issue: '', priority: 'medium' });
    setShowMaintenanceModal(true);
  };

  const handleOpenDetailsModal = (room: RoomStatus) => {
    setSelectedRoom(room);
    setShowDetailsModal(true);
  };

  const handleUpdateStatus = () => {
    if (!selectedRoom || !statusUpdate.cleaningStatus) {
      toast.error('Please select a cleaning status');
      return;
    }

    const updatedRooms = roomStatuses.map(r =>
      r.roomNumber === selectedRoom.roomNumber ? {
        ...r,
        cleaningStatus: statusUpdate.cleaningStatus as typeof r.cleaningStatus,
        notes: statusUpdate.notes || undefined,
        lastCleaned: ['clean', 'inspected', 'ready'].includes(statusUpdate.cleaningStatus)
          ? new Date().toISOString()
          : r.lastCleaned
      } : r
    );
    setRoomStatuses(updatedRooms);

    const roomIndex = dataStore.roomStatuses.findIndex(r => r.roomNumber === selectedRoom.roomNumber);
    if (roomIndex !== -1) {
      dataStore.roomStatuses[roomIndex] = updatedRooms.find(r => r.roomNumber === selectedRoom.roomNumber)!;
    }

    toast.success(`Room ${selectedRoom.roomNumber} status updated to ${statusUpdate.cleaningStatus}`);
    setShowStatusModal(false);
    setSelectedRoom(null);
  };

  const handleAssignStaff = () => {
    if (!selectedRoom || !assignData.assignedTo) {
      toast.error('Please select a staff member');
      return;
    }

    const updatedRooms = roomStatuses.map(r =>
      r.roomNumber === selectedRoom.roomNumber ? {
        ...r,
        assignedTo: assignData.assignedTo
      } : r
    );
    setRoomStatuses(updatedRooms);

    const roomIndex = dataStore.roomStatuses.findIndex(r => r.roomNumber === selectedRoom.roomNumber);
    if (roomIndex !== -1) {
      dataStore.roomStatuses[roomIndex].assignedTo = assignData.assignedTo;
    }

    toast.success(`Room ${selectedRoom.roomNumber} assigned to ${assignData.assignedTo}`);
    setShowAssignModal(false);
    setSelectedRoom(null);
  };

  const handleReportMaintenance = () => {
    if (!selectedRoom || !maintenanceData.issue) {
      toast.error('Please describe the maintenance issue');
      return;
    }

    // In real app, this would create a maintenance request
    toast.success(`Maintenance request created for Room ${selectedRoom.roomNumber}`);
    setShowMaintenanceModal(false);
    setSelectedRoom(null);
  };

  const formatLastCleaned = (dateString?: string) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

    if (diffHours < 24) {
      return `${diffHours}h ago`;
    }
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Room Status</h1>
          <p className="text-gray-600 mt-1">Real-time housekeeping operations and room readiness</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">Total Rooms</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">Dirty</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{stats.dirty}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">In Progress</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.clean}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">Ready</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.ready}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">Maintenance</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">{stats.outOfOrder}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">Occupied</p>
          <p className="text-2xl font-bold text-blue-500 mt-1">{stats.occupied}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search room number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Floor Filter */}
          <select
            value={filterFloor}
            onChange={(e) => setFilterFloor(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Floors</option>
            {floors.map(floor => (
              <option key={floor} value={floor.toString()}>Floor {floor}</option>
            ))}
          </select>

          {/* Cleaning Status Filter */}
          <select
            value={filterCleaningStatus}
            onChange={(e) => setFilterCleaningStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Cleaning Status</option>
            <option value="dirty">Dirty</option>
            <option value="clean">Clean</option>
            <option value="inspected">Inspected</option>
            <option value="ready">Ready</option>
            <option value="out-of-order">Out of Order</option>
            <option value="out-of-service">Out of Service</option>
          </select>

          {/* Occupancy Filter */}
          <select
            value={filterOccupancy}
            onChange={(e) => setFilterOccupancy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Occupancy</option>
            <option value="vacant">Vacant</option>
            <option value="occupied">Occupied</option>
            <option value="reserved">Reserved</option>
          </select>
        </div>
      </div>

      {/* Rooms Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Floor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cleaning Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Occupancy</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Cleaned</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredRooms.map((room) => (
              <tr key={room.roomNumber} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{room.roomNumber}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">{room.floor}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{room.type}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full capitalize ${getCleaningStatusColor(room.cleaningStatus)}`}>
                    {room.cleaningStatus.replace('-', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full capitalize ${getOccupancyColor(room.occupancyStatus)}`}>
                    {room.occupancyStatus}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">
                    {room.assignedTo || <span className="text-gray-400">—</span>}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{formatLastCleaned(room.lastCleaned)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleOpenStatusModal(room)}
                      className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                    >
                      <ClipboardCheck className="w-4 h-4" />
                      Update
                    </button>
                    <button
                      onClick={() => handleOpenAssignModal(room)}
                      className="text-purple-600 hover:text-purple-800 inline-flex items-center gap-1"
                    >
                      <UserPlus className="w-4 h-4" />
                      Assign
                    </button>
                    <button
                      onClick={() => handleOpenDetailsModal(room)}
                      className="text-gray-600 hover:text-gray-800 inline-flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredRooms.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No rooms found</p>
            <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {/* Update Status Modal */}
      <FormModal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setSelectedRoom(null);
        }}
        onSubmit={handleUpdateStatus}
        title={`Update Status - Room ${selectedRoom?.roomNumber}`}
        submitText="Update Status"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cleaning Status *</label>
            <select
              value={statusUpdate.cleaningStatus}
              onChange={(e) => setStatusUpdate({ ...statusUpdate, cleaningStatus: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select status...</option>
              <option value="dirty">Dirty</option>
              <option value="clean">Clean</option>
              <option value="inspected">Inspected</option>
              <option value="ready">Ready</option>
              <option value="out-of-order">Out of Order</option>
              <option value="out-of-service">Out of Service</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={statusUpdate.notes}
              onChange={(e) => setStatusUpdate({ ...statusUpdate, notes: e.target.value })}
              placeholder="Add any additional notes..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {selectedRoom && (
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-xs font-medium text-gray-500 mb-1">Current Status</p>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getCleaningStatusColor(selectedRoom.cleaningStatus)}`}>
                  {selectedRoom.cleaningStatus.replace('-', ' ').toUpperCase()}
                </span>
                <span className="text-xs text-gray-500">→</span>
                {statusUpdate.cleaningStatus && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getCleaningStatusColor(statusUpdate.cleaningStatus)}`}>
                    {statusUpdate.cleaningStatus.replace('-', ' ').toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </FormModal>

      {/* Assign Staff Modal */}
      <FormModal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedRoom(null);
        }}
        onSubmit={handleAssignStaff}
        title={`Assign Staff - Room ${selectedRoom?.roomNumber}`}
        submitText="Assign"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Housekeeper *</label>
            <select
              value={assignData.assignedTo}
              onChange={(e) => setAssignData({ assignedTo: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select staff member...</option>
              {housekeepingStaff.map(staff => (
                <option key={staff.id} value={staff.username}>
                  {staff.fullName} ({staff.username})
                </option>
              ))}
            </select>
          </div>

          {selectedRoom && (
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p className="text-xs font-medium text-blue-700 mb-1">Room Information</p>
              <div className="text-sm text-blue-900">
                <p><span className="font-medium">Type:</span> {selectedRoom.type}</p>
                <p><span className="font-medium">Current Assignment:</span> {selectedRoom.assignedTo || 'None'}</p>
              </div>
            </div>
          )}
        </div>
      </FormModal>

      {/* Report Maintenance Modal */}
      <FormModal
        isOpen={showMaintenanceModal}
        onClose={() => {
          setShowMaintenanceModal(false);
          setSelectedRoom(null);
        }}
        onSubmit={handleReportMaintenance}
        title={`Report Maintenance - Room ${selectedRoom?.roomNumber}`}
        submitText="Create Request"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Issue Description *</label>
            <textarea
              value={maintenanceData.issue}
              onChange={(e) => setMaintenanceData({ ...maintenanceData, issue: e.target.value })}
              placeholder="Describe the maintenance issue..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority *</label>
            <select
              value={maintenanceData.priority}
              onChange={(e) => setMaintenanceData({ ...maintenanceData, priority: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="low">Low - Can wait</option>
              <option value="medium">Medium - Schedule soon</option>
              <option value="high">High - Urgent attention needed</option>
            </select>
          </div>

          <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
            <p className="text-xs font-medium text-orange-700 mb-1">⚠️ Note</p>
            <p className="text-xs text-orange-900">
              This will create a maintenance request and may mark the room as out-of-order until resolved.
            </p>
          </div>
        </div>
      </FormModal>

      {/* View Details Modal */}
      <FormModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedRoom(null);
        }}
        onSubmit={() => {
          setShowDetailsModal(false);
          setSelectedRoom(null);
        }}
        title={`Room ${selectedRoom?.roomNumber} - Details`}
        submitText="Close"
        size="md"
      >
        {selectedRoom && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Room Number</p>
                <p className="text-sm font-semibold text-gray-900">{selectedRoom.roomNumber}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Floor</p>
                <p className="text-sm font-semibold text-gray-900">Floor {selectedRoom.floor}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Room Type</p>
                <p className="text-sm font-semibold text-gray-900">{selectedRoom.type}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Occupancy Status</p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getOccupancyColor(selectedRoom.occupancyStatus)}`}>
                  {selectedRoom.occupancyStatus.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Cleaning Status</p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getCleaningStatusColor(selectedRoom.cleaningStatus)}`}>
                  {selectedRoom.cleaningStatus.replace('-', ' ').toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Assigned To</p>
                <p className="text-sm font-semibold text-gray-900">{selectedRoom.assignedTo || 'Unassigned'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs font-medium text-gray-500 mb-1">Last Cleaned</p>
                <p className="text-sm font-semibold text-gray-900">
                  {selectedRoom.lastCleaned
                    ? new Date(selectedRoom.lastCleaned).toLocaleString()
                    : 'Never'}
                </p>
              </div>
            </div>

            {selectedRoom.notes && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs font-medium text-gray-500 mb-1">Notes</p>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{selectedRoom.notes}</p>
              </div>
            )}
          </div>
        )}
      </FormModal>
    </div>
  );
}
