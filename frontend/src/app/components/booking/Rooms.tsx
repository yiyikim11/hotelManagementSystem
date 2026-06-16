import { useState, useEffect, useCallback } from 'react';
import { Search, Eye, Globe, Image, ToggleLeft, ToggleRight, Info, Edit2, Loader } from 'lucide-react';
import FormModal from '../shared/FormModal';
import { toast } from 'sonner';
import { roomTypesApi, type RoomType } from '../../services/pms/roomTypesApi';
import { websiteListingsApi, type WebsiteRoomListing } from '../../services/booking/websiteListingsApi';

interface Combined {
  roomType: RoomType;
  listing: WebsiteRoomListing;
}

export default function BookingRooms() {
  const [pmsRoomTypes, setPmsRoomTypes] = useState<RoomType[]>([]);
  const [listings, setListings] = useState<WebsiteRoomListing[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'unpublished'>('all');

  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<string | null>(null);

  const [editForm, setEditForm] = useState({
    websiteDescription: '',
    websitePhotos: '',
    promotionalRate: '',
    promotionalRateDescription: '',
    featuredAmenities: '',
    displayOrder: '1',
  });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [rtPage, listingList] = await Promise.all([
        roomTypesApi.list(0, 200),
        websiteListingsApi.list(),
      ]);
      setPmsRoomTypes(rtPage.content);
      setListings(listingList);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load website listings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const getListing = (roomTypeId: string) => listings.find(l => l.roomTypeId === roomTypeId);
  const getRoomType = (id: string) => pmsRoomTypes.find(rt => rt.id === id);

  const combined: Combined[] = pmsRoomTypes.map(rt => {
    const listing = getListing(rt.id) ?? {
      id: null,
      roomTypeId: rt.id,
      isPublished: false,
      websiteDescription: null,
      websitePhotos: [],
      displayOrder: 999,
      promotionalRate: null,
      promotionalRateDescription: null,
      featuredAmenities: [],
      updatedAt: null,
    };
    return { roomType: rt, listing };
  });

  const filteredRooms = combined.filter(({ roomType, listing }) => {
    const matchesSearch = !searchTerm ||
      roomType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (roomType.description ?? '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'published' && listing.isPublished) ||
      (filterStatus === 'unpublished' && !listing.isPublished);
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalRoomTypes: pmsRoomTypes.length,
    published: listings.filter(l => l.isPublished).length,
    unpublished: pmsRoomTypes.length - listings.filter(l => l.isPublished).length,
    withPromo: listings.filter(l => l.promotionalRate != null).length,
  };

  const handleTogglePublish = async (roomTypeId: string) => {
    try {
      const updated = await websiteListingsApi.toggle(roomTypeId);
      setListings(prev => {
        const idx = prev.findIndex(l => l.roomTypeId === roomTypeId);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = updated;
          return next;
        }
        return [...prev, updated];
      });
      toast.success(updated.isPublished ? 'Room published to website' : 'Room unpublished from website');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to toggle publish');
    }
  };

  const handleEdit = (roomTypeId: string) => {
    const listing = getListing(roomTypeId);
    setSelectedRoomTypeId(roomTypeId);
    setEditForm({
      websiteDescription: listing?.websiteDescription ?? '',
      websitePhotos: (listing?.websitePhotos ?? []).join('\n'),
      promotionalRate: listing?.promotionalRate != null ? String(listing.promotionalRate) : '',
      promotionalRateDescription: listing?.promotionalRateDescription ?? '',
      featuredAmenities: (listing?.featuredAmenities ?? []).join(', '),
      displayOrder: String(listing?.displayOrder ?? 1),
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedRoomTypeId) return;
    try {
      const photos = editForm.websitePhotos.split('\n').map(p => p.trim()).filter(Boolean);
      const amenities = editForm.featuredAmenities.split(',').map(a => a.trim()).filter(Boolean);
      const updated = await websiteListingsApi.upsert(selectedRoomTypeId, {
        websiteDescription: editForm.websiteDescription || null,
        websitePhotos: photos,
        displayOrder: parseInt(editForm.displayOrder) || 1,
        promotionalRate: editForm.promotionalRate ? parseFloat(editForm.promotionalRate) : null,
        promotionalRateDescription: editForm.promotionalRateDescription || null,
        featuredAmenities: amenities,
      });
      setListings(prev => {
        const idx = prev.findIndex(l => l.roomTypeId === selectedRoomTypeId);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = updated;
          return next;
        }
        return [...prev, updated];
      });
      toast.success('Website listing updated');
      setShowEditModal(false);
      setSelectedRoomTypeId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  const handleView = (roomTypeId: string) => {
    setSelectedRoomTypeId(roomTypeId);
    setShowViewModal(true);
  };

  const selectedRoomType = selectedRoomTypeId ? getRoomType(selectedRoomTypeId) : null;
  const selectedListing = selectedRoomTypeId ? getListing(selectedRoomTypeId) : undefined;

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Website Room Listings</h1>
        <p className="text-gray-600 mt-1">Manage room types displayed on your hotel website</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-900">Room data is synchronized from the Property Management System</p>
          <p className="text-sm text-blue-700 mt-1">
            Room types and pricing are managed in <strong>PMS → Room Types</strong>. Use this page to control which rooms appear on your website.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">Total Room Types</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalRoomTypes}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">Published</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.published}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">Unpublished</p>
          <p className="text-2xl font-bold text-gray-500 mt-1">{stats.unpublished}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">With Promo Rates</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">{stats.withPromo}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search room types..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Room Types</option>
            <option value="published">Published Only</option>
            <option value="unpublished">Unpublished Only</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room Type (PMS)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Base Rate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Promo Rate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Photos</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Website Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredRooms.map(({ roomType, listing }) => (
              <tr key={roomType.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{roomType.name}</div>
                  <div className="text-xs text-gray-500">{roomType.code}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">${roomType.baseRate}</div>
                  <div className="text-xs text-gray-500">per night</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {listing.promotionalRate ? (
                    <div>
                      <div className="text-sm font-semibold text-orange-600">${listing.promotionalRate}</div>
                      <div className="text-xs text-gray-500">{listing.promotionalRateDescription}</div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">—</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Image className="w-4 h-4" />
                    {listing.websitePhotos.length} photos
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    listing.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {listing.isPublished ? 'Published' : 'Unpublished'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleEdit(roomType.id)} className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1">
                      <Edit2 className="w-4 h-4" />Edit
                    </button>
                    <button
                      onClick={() => handleTogglePublish(roomType.id)}
                      className={`inline-flex items-center gap-1 ${
                        listing.isPublished ? 'text-gray-600 hover:text-gray-800' : 'text-green-600 hover:text-green-800'
                      }`}
                    >
                      {listing.isPublished ? (<><ToggleLeft className="w-4 h-4" />Unpublish</>) : (<><ToggleRight className="w-4 h-4" />Publish</>)}
                    </button>
                    <button onClick={() => handleView(roomType.id)} className="text-gray-600 hover:text-gray-800 inline-flex items-center gap-1">
                      <Eye className="w-4 h-4" />View
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredRooms.length === 0 && (
          <div className="text-center py-12">
            <Globe className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No room types found</p>
          </div>
        )}
      </div>

      <FormModal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setSelectedRoomTypeId(null); }}
        onSubmit={handleSaveEdit}
        title={`Edit Website Listing - ${selectedRoomType?.name ?? ''}`}
        submitText="Save Changes"
        size="lg"
      >
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-xs font-medium text-gray-500 mb-2">PMS Room Type (Read-Only)</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-600">Name:</span> <span className="font-medium">{selectedRoomType?.name}</span></div>
              <div><span className="text-gray-600">Base Rate:</span> <span className="font-medium">${selectedRoomType?.baseRate}</span></div>
              <div><span className="text-gray-600">Max Occupancy:</span> <span className="font-medium">{selectedRoomType?.maxOccupancy}</span></div>
              <div><span className="text-gray-600">Code:</span> <span className="font-medium">{selectedRoomType?.code}</span></div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Website Description</label>
            <textarea
              value={editForm.websiteDescription}
              onChange={(e) => setEditForm({ ...editForm, websiteDescription: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Leave blank to use PMS description</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Website Photos (URLs, one per line)</label>
            <textarea
              value={editForm.websitePhotos}
              onChange={(e) => setEditForm({ ...editForm, websitePhotos: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Promotional Rate ($)</label>
              <input
                type="number" step="0.01"
                value={editForm.promotionalRate}
                onChange={(e) => setEditForm({ ...editForm, promotionalRate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Promo Description</label>
              <input
                type="text"
                value={editForm.promotionalRateDescription}
                onChange={(e) => setEditForm({ ...editForm, promotionalRateDescription: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Featured Amenities (comma-separated)</label>
            <input
              type="text"
              value={editForm.featuredAmenities}
              onChange={(e) => setEditForm({ ...editForm, featuredAmenities: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
            <input
              type="number"
              value={editForm.displayOrder}
              onChange={(e) => setEditForm({ ...editForm, displayOrder: e.target.value })}
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Lower numbers appear first on the website</p>
          </div>
        </div>
      </FormModal>

      <FormModal
        isOpen={showViewModal}
        onClose={() => { setShowViewModal(false); setSelectedRoomTypeId(null); }}
        onSubmit={() => { setShowViewModal(false); setSelectedRoomTypeId(null); }}
        title={`${selectedRoomType?.name ?? ''} - Details`}
        submitText="Close"
        size="lg"
      >
        {selectedRoomType && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500">Code</p><p className="font-medium">{selectedRoomType.code}</p></div>
              <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500">Max Occupancy</p><p className="font-medium">{selectedRoomType.maxOccupancy}</p></div>
              <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500">Base Rate</p><p className="font-medium">${selectedRoomType.baseRate}</p></div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Website Status</p>
                <p className={`font-medium ${selectedListing?.isPublished ? 'text-green-700' : 'text-gray-600'}`}>
                  {selectedListing?.isPublished ? 'Published' : 'Unpublished'}
                </p>
              </div>
            </div>
            {selectedRoomType.description && (
              <div>
                <p className="text-xs text-gray-500 mb-1">PMS Description</p>
                <p className="bg-gray-50 p-3 rounded-lg">{selectedRoomType.description}</p>
              </div>
            )}
            {selectedListing?.websiteDescription && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Custom Website Description</p>
                <p className="bg-gray-50 p-3 rounded-lg">{selectedListing.websiteDescription}</p>
              </div>
            )}
            {selectedListing?.promotionalRate != null && (
              <div className="bg-orange-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Promotional Rate</p>
                <p className="text-lg font-bold text-orange-600">${selectedListing.promotionalRate}</p>
                {selectedListing.promotionalRateDescription && <p>{selectedListing.promotionalRateDescription}</p>}
              </div>
            )}
            {selectedListing && selectedListing.websitePhotos.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Photos ({selectedListing.websitePhotos.length})</p>
                <div className="space-y-1">
                  {selectedListing.websitePhotos.map((url, idx) => (
                    <div key={idx} className="text-xs text-gray-600 font-mono bg-gray-50 p-2 rounded break-all">{url}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </FormModal>
    </div>
  );
}
