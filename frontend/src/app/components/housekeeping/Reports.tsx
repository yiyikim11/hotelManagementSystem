import { useState } from 'react';
import { FileText, Download, Calendar, ClipboardList, Wrench, Package } from 'lucide-react';
import { dataStore } from '../../data/store';

export default function HousekeepingReports() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const roomStatuses = dataStore.getRoomStatuses();
  const tasks = dataStore.getHousekeepingTasks();
  const maintenanceRequests = dataStore.getMaintenanceRequests();
  const lostFoundItems = dataStore.getLostFoundItems();

  // Filter tasks by selected date
  const todayTasks = tasks.filter(task =>
    task.assignedDate === selectedDate
  );

  // Room status breakdown
  const roomsByCleaningStatus = {
    clean: roomStatuses.filter(r => r.cleaningStatus === 'clean').length,
    dirty: roomStatuses.filter(r => r.cleaningStatus === 'dirty').length,
    'in-progress': roomStatuses.filter(r => r.cleaningStatus === 'in-progress').length,
    'do-not-disturb': roomStatuses.filter(r => r.cleaningStatus === 'do-not-disturb').length,
  };

  const roomsByOccupancy = {
    occupied: roomStatuses.filter(r => r.occupancyStatus === 'occupied').length,
    vacant: roomStatuses.filter(r => r.occupancyStatus === 'vacant').length,
    reserved: roomStatuses.filter(r => r.occupancyStatus === 'reserved').length,
  };

  // Task status breakdown
  const tasksByStatus = {
    pending: todayTasks.filter(t => t.status === 'pending').length,
    'in-progress': todayTasks.filter(t => t.status === 'in-progress').length,
    completed: todayTasks.filter(t => t.status === 'completed').length,
  };

  // Maintenance status
  const maintenanceByStatus = {
    open: maintenanceRequests.filter(r => r.status === 'open').length,
    'in-progress': maintenanceRequests.filter(r => r.status === 'in-progress').length,
    completed: maintenanceRequests.filter(r => r.status === 'completed').length,
  };

  const maintenanceByPriority = {
    urgent: maintenanceRequests.filter(r => r.priority === 'urgent').length,
    high: maintenanceRequests.filter(r => r.priority === 'high').length,
    medium: maintenanceRequests.filter(r => r.priority === 'medium').length,
    low: maintenanceRequests.filter(r => r.priority === 'low').length,
  };

  // Lost & Found status
  const lostFoundByStatus = {
    unclaimed: lostFoundItems.filter(i => i.status === 'unclaimed').length,
    claimed: lostFoundItems.filter(i => i.status === 'claimed').length,
  };

  const generateReport = () => {
    const reportContent = `
HOUSEKEEPING DAILY REPORT
Date: ${selectedDate}
Generated: ${new Date().toLocaleString()}

===========================================
ROOM STATUS SUMMARY
===========================================
Total Rooms: ${roomStatuses.length}

Cleaning Status:
  - Clean: ${roomsByCleaningStatus.clean}
  - Dirty: ${roomsByCleaningStatus.dirty}
  - In Progress: ${roomsByCleaningStatus['in-progress']}
  - Do Not Disturb: ${roomsByCleaningStatus['do-not-disturb']}

Occupancy Status:
  - Occupied: ${roomsByOccupancy.occupied}
  - Vacant: ${roomsByOccupancy.vacant}
  - Reserved: ${roomsByOccupancy.reserved}

===========================================
HOUSEKEEPING TASKS (${selectedDate})
===========================================
Total Tasks: ${todayTasks.length}

Task Status:
  - Pending: ${tasksByStatus.pending}
  - In Progress: ${tasksByStatus['in-progress']}
  - Completed: ${tasksByStatus.completed}

Completion Rate: ${todayTasks.length > 0 ? Math.round((tasksByStatus.completed / todayTasks.length) * 100) : 0}%

===========================================
MAINTENANCE REQUESTS
===========================================
Total Requests: ${maintenanceRequests.length}

Status:
  - Open: ${maintenanceByStatus.open}
  - In Progress: ${maintenanceByStatus['in-progress']}
  - Completed: ${maintenanceByStatus.completed}

Priority:
  - Urgent: ${maintenanceByPriority.urgent}
  - High: ${maintenanceByPriority.high}
  - Medium: ${maintenanceByPriority.medium}
  - Low: ${maintenanceByPriority.low}

===========================================
LOST & FOUND
===========================================
Total Items: ${lostFoundItems.length}

Status:
  - Unclaimed: ${lostFoundByStatus.unclaimed}
  - Claimed: ${lostFoundByStatus.claimed}

===========================================
END OF REPORT
===========================================
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `housekeeping-report-${selectedDate}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Housekeeping Reports</h1>
          <p className="text-gray-600 mt-1">Generate operational reports and daily status summaries</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={generateReport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download className="w-5 h-5" />
            Download Report
          </button>
        </div>
      </div>

      {/* Room Status Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Room Status Summary</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Cleaning Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Clean</span>
                <span className="font-semibold text-green-600">{roomsByCleaningStatus.clean}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Dirty</span>
                <span className="font-semibold text-red-600">{roomsByCleaningStatus.dirty}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">In Progress</span>
                <span className="font-semibold text-blue-600">{roomsByCleaningStatus['in-progress']}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Do Not Disturb</span>
                <span className="font-semibold text-yellow-600">{roomsByCleaningStatus['do-not-disturb']}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Occupancy Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Occupied</span>
                <span className="font-semibold text-gray-900">{roomsByOccupancy.occupied}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Vacant</span>
                <span className="font-semibold text-gray-900">{roomsByOccupancy.vacant}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Reserved</span>
                <span className="font-semibold text-gray-900">{roomsByOccupancy.reserved}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Tasks for {selectedDate}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{todayTasks.length}</div>
            <div className="text-sm text-gray-600 mt-1">Total Tasks</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-700">{tasksByStatus.pending}</div>
            <div className="text-sm text-gray-600 mt-1">Pending</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-700">{tasksByStatus['in-progress']}</div>
            <div className="text-sm text-gray-600 mt-1">In Progress</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-700">{tasksByStatus.completed}</div>
            <div className="text-sm text-gray-600 mt-1">Completed</div>
          </div>
        </div>
        {todayTasks.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="text-sm text-gray-700">
              <span className="font-semibold">Completion Rate:</span>{' '}
              <span className="text-blue-700 font-bold">
                {Math.round((tasksByStatus.completed / todayTasks.length) * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Maintenance Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Wrench className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Maintenance Requests</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">By Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Open</span>
                <span className="font-semibold text-red-600">{maintenanceByStatus.open}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">In Progress</span>
                <span className="font-semibold text-blue-600">{maintenanceByStatus['in-progress']}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completed</span>
                <span className="font-semibold text-green-600">{maintenanceByStatus.completed}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">By Priority</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Urgent</span>
                <span className="font-semibold text-red-600">{maintenanceByPriority.urgent}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">High</span>
                <span className="font-semibold text-orange-600">{maintenanceByPriority.high}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Medium</span>
                <span className="font-semibold text-yellow-600">{maintenanceByPriority.medium}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Low</span>
                <span className="font-semibold text-gray-600">{maintenanceByPriority.low}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lost & Found Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Lost & Found</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{lostFoundItems.length}</div>
            <div className="text-sm text-gray-600 mt-1">Total Items</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-700">{lostFoundByStatus.unclaimed}</div>
            <div className="text-sm text-gray-600 mt-1">Unclaimed</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-700">{lostFoundByStatus.claimed}</div>
            <div className="text-sm text-gray-600 mt-1">Claimed</div>
          </div>
        </div>
      </div>
    </div>
  );
}
