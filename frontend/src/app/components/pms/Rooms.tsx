import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, DoorClosed, Layers } from 'lucide-react';
import { roomsApi, type Room, type RoomRequest, type RoomStatus } from '../../services/pms/roomsApi';
import { roomTypesApi, type RoomType } from '../../services/pms/roomTypesApi';
import FormModal from '../shared/FormModal';

const STATUSES: RoomStatus[] = ['AVAILABLE', 'OCCUPIED', 'OUT_OF_ORDER', 'OUT_OF_SERVICE', 'MAINTENANCE'];

const STATUS_STYLES: Record<RoomStatus, string> = {
  AVAILABLE: 'bg-green-100 text-green-700',
  OCCUPIED: 'bg-blue-100 text-blue-700',
  OUT_OF_ORDER: 'bg-red-100 text-red-700',
  OUT_OF_SERVICE: 'bg-gray-200 text-gray-700',
  MAINTENANCE: 'bg-orange-100 text-orange-700',
};

const emptyForm = { roomNumber: '', roomTypeId: '', floor: '', status: 'AVAILABLE' as RoomStatus, notes: '' };

export default function Rooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [roomsPage, typesPage] = await Promise.all([
        roomsApi.list(0, 200),
        roomTypesApi.list(0, 100, false),
      ]);
      setRooms(roomsPage.content);
      setRoomTypes(typesPage.content);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = () => {
    setEditingRoom(null);
    setForm({ ...emptyForm, roomTypeId: roomTypes[0]?.id ?? '' });
    setShowModal(true);
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setForm({
      roomNumber: room.roomNumber,
      roomTypeId: room.roomTypeId,
      floor: room.floor != null ? String(room.floor) : '',
      status: room.status,
      notes: room.notes ?? '',
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    const payload: RoomRequest = {
      roomNumber: form.roomNumber.trim(),
      roomTypeId: form.roomTypeId,
      status: form.status,
      ...(form.floor.trim() ? { floor: parseInt(form.floor) } : {}),
      ...(form.notes.trim() ? { notes: form.notes.trim() } : {}),
    };
    try {
      if (editingRoom) {
        await roomsApi.update(editingRoom.id, payload);
        if (form.status !== editingRoom.status) {
          await roomsApi.updateStatus(editingRoom.id, form.status);
        }
      } else {
        const created = await roomsApi.create(payload);
        if (form.status !== 'AVAILABLE') {
          await roomsApi.updateStatus(created.id, form.status);
        }
      }
      setShowModal(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save room');
    }
  };

  const handleDelete = async (room: Room) => {
    if (!confirm(`Delete room "${room.roomNumber}"? This cannot be undone.`)) return;
    try {
      await roomsApi.delete(room.id);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete room');
    }
  };

  const typeLabel = (room: Room) => {
    const rt = roomTypes.find(t => t.id === room.roomTypeId);
    return rt ? `${rt.name} (${rt.code})` : room.roomTypeCode;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rooms</h1>
          <p className="text-gray-600 mt-1">Manage physical rooms and their inventory</p>
        </div>
        <button onClick={handleAdd} disabled={roomTypes.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          <Plus className="w-5 h-5" /> Add Room
        </button>
      </div>

      {roomTypes.length === 0 && !loading && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
          Create a Room Type first — rooms must belong to a room type.
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading…</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Floor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rooms.map(room => (
                <tr key={room.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 font-medium text-gray-900">
                      <DoorClosed className="w-4 h-4 text-gray-400" />
                      {room.roomNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{typeLabel(room)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {room.floor != null ? (
                      <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5 text-gray-400" />{room.floor}</span>
                    ) : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[room.status]}`}>
                      {room.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{room.notes || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => handleEdit(room)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(room)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rooms.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No rooms found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <FormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        title={editingRoom ? `Edit Room — ${editingRoom.roomNumber}` : 'Add Room'}
        submitText={editingRoom ? 'Save Changes' : 'Create Room'}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room Number *</label>
            <input
              type="text"
              value={form.roomNumber}
              onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
              placeholder="301"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room Type *</label>
            <select
              value={form.roomTypeId}
              onChange={(e) => setForm({ ...form, roomTypeId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="" disabled>Select a type…</option>
              {roomTypes.map(rt => (
                <option key={rt.id} value={rt.id}>{rt.name} ({rt.code})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
            <input
              type="number"
              value={form.floor}
              onChange={(e) => setForm({ ...form, floor: e.target.value })}
              placeholder="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as RoomStatus })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {STATUSES.map(s => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </FormModal>
    </div>
  );
}
