import { useState } from 'react';
import { Search, Eye, Globe, Image, ToggleLeft, ToggleRight, Info, Edit2 } from 'lucide-react';
import { dataStore } from '../../data/store';
import { RoomType, WebsiteRoomListing } from '../../types';
import FormModal from '../shared/FormModal';
import { toast } from 'sonner';

export default function BookingRooms() {
  // PMS Room Types (read-only source of truth)
  const [pmsRoomTypes] = useState<RoomType[]>(dataStore.getRoomTypes());

  // Website Room Listings (editable for website display)
  const [websiteListings, setWebsiteListings] = useState<WebsiteRoomListing[]>(
    dataStore.getWebsiteRoomListings()
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'unpublished'>('all');

  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<string | null>(null);

  // Form data
  const [editForm, setEditForm] = useState({
    websiteDescription: '',
    websitePhotos: '',
    promotionalRate: '',
    promotionalRateDescription: '',
    featuredAmenities: '',
    displayOrder: '1'
  });

  // Get PMS room type by ID
  const getRoomTypeById = (id: string): RoomType | undefined => {
    return pmsRoomTypes.find(rt => rt.id === id);
  };

  // Get website listing by room type ID
  const getListingByRoomTypeId = (roomTypeId: string): WebsiteRoomListing | undefined => {
    return websiteListings.find(wl => wl.roomTypeId === roomTypeId);
  };

  // Combine PMS room types with website listings for display
  const combinedRooms = pmsRoomTypes.map(roomType => {
    const listing = getListingByRoomTypeId(roomType.id);
    return {
      roomType,
      listing: listing || {
        roomTypeId: roomType.id,
        isPublished: false,
        websitePhotos: [],
        displayOrder: 999,
        lastUpdated: new Date().toISOString()
      }
    };
  });

  // Apply filters
  const filteredRooms = combinedRooms.filter(({ roomType, listing }) => {
    const matchesSearch = !searchTerm ||
      roomType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      roomType.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'published' && listing.isPublished) ||
      (filterStatus === 'unpublished' && !listing.isPublished);

    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    totalRoomTypes: pmsRoomTypes.length,
    published: websiteListings.filter(wl => wl.isPublished).length,
    unpublished: pmsRoomTypes.length - websiteListings.filter(wl => wl.isPublished).length,
    withPromo: websiteListings.filter(wl => wl.promotionalRate).length
  };

  // Toggle publish status
  const handleTogglePublish = (roomTypeId: string) => {
    const existingListing = getListingByRoomTypeId(roomTypeId);

    if (existingListing) {
      // Update existing listing
      const updatedListings = websiteListings.map(wl =>
        wl.roomTypeId === roomTypeId
          ? { ...wl, isPublished: !wl.isPublished, lastUpdated: new Date().toISOString() }
          : wl
      );
      setWebsiteListings(updatedListings);

      const listingIndex = dataStore.websiteRoomListings.findIndex(wl => wl.roomTypeId === roomTypeId);
      if (listingIndex !== -1) {
        dataStore.websiteRoomListings[listingIndex] = updatedListings.find(wl => wl.roomTypeId === roomTypeId)!;
      }

      toast.success(existingListing.isPublished ? 'Room unpublished from website' : 'Room published to website');
    } else {
      // Create new listing as published
      const newListing: WebsiteRoomListing = {
        roomTypeId,
        isPublished: true,
        websitePhotos: [],
        displayOrder: websiteListings.length + 1,
        lastUpdated: new Date().toISOString()
      };

      setWebsiteListings([...websiteListings, newListing]);
      dataStore.websiteRoomListings.push(newListing);

      toast.success('Room published to website');
    }
  };

  // Open edit modal
  const handleEdit = (roomTypeId: string) => {
    const listing = getListingByRoomTypeId(roomTypeId);
    const roomType = getRoomTypeById(roomTypeId);

    if (!roomType) return;

    setSelectedRoomTypeId(roomTypeId);
    setEditForm({
      websiteDescription: listing?.websiteDescription || '',
      websitePhotos: listing?.websitePhotos?.join('\n') || '',
      promotionalRate: listing?.promotionalRate?.toString() || '',
      promotionalRateDescription: listing?.promotionalRateDescription || '',
      featuredAmenities: listing?.featuredAmenities?.join(', ') || '',
      displayOrder: listing?.displayOrder?.toString() || '1'
    });
    setShowEditModal(true);
  };

  // Open view modal
  const handleView = (roomTypeId: string) => {
    setSelectedRoomTypeId(roomTypeId);
    setShowViewModal(true);
  };

  // Save edits
  const handleSaveEdit = () => {
    if (!selectedRoomTypeId) return;

    const existingListing = getListingByRoomTypeId(selectedRoomTypeId);
    const photos = editForm.websitePhotos
      .split('\n')
      .map(p => p.trim())
      .filter(p => p);

    const updatedListing: WebsiteRoomListing = {
      roomTypeId: selectedRoomTypeId,
      isPublished: existingListing?.isPublished || false,
      websiteDescription: editForm.websiteDescription || undefined,
      websitePhotos: photos,
      displayOrder: parseInt(editForm.displayOrder) || 1,
      promotionalRate: editForm.promotionalRate ? parseFloat(editForm.promotionalRate) : undefined,
      promotionalRateDescription: editForm.promotionalRateDescription || undefined,
      featuredAmenities: editForm.featuredAmenities
        ? editForm.featuredAmenities.split(',').map(a => a.trim()).filter(a => a)
        : undefined,
      lastUpdated: new Date().toISOString()
    };

    if (existingListing) {
      // Update existing
      const updatedListings = websiteListings.map(wl =>
        wl.roomTypeId === selectedRoomTypeId ? updatedListing : wl
      );
      setWebsiteListings(updatedListings);

      const listingIndex = dataStore.websiteRoomListings.findIndex(wl => wl.roomTypeId === selectedRoomTypeId);
      if (listingIndex !== -1) {
        dataStore.websiteRoomListings[listingIndex] = updatedListing;
      }
    } else {
      // Create new
      setWebsiteListings([...websiteListings, updatedListing]);
      dataStore.websiteRoomListings.push(updatedListing);
    }

    toast.success('Website listing updated successfully');
    setShowEditModal(false);
    setSelectedRoomTypeId(null);
  };

  const selectedRoomType = selectedRoomTypeId ? getRoomTypeById(selectedRoomTypeId) : null;
  const selectedListing = selectedRoomTypeId ? getListingByRoomTypeId(selectedRoomTypeId) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Website Room Listings</h1>
          <p className="text-gray-600 mt-1">Manage room types displayed on your hotel website</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-900">Room data is synchronized from the Property Management System</p>
          <p className="text-sm text-blue-700 mt-1">
            Room types, pricing, and inventory are managed in <strong>PMS → Room Types</strong>.
            Use this page to control which rooms appear on your website and customize their online presentation.
          </p>
        </div>
      </div>

      {/* Stats */}
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

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search room types..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Room Types</option>
            <option value="published">Published Only</option>
            <option value="unpublished">Unpublished Only</option>
          </select>
        </div>
      </div>

      {/* Rooms Table */}
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
                  <div className="text-xs text-gray-500">{roomType.id} • {roomType.totalRooms} rooms</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">${roomType.basePrice}</div>
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
                    {listing.websitePhotos?.length || 0} photos
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    listing.isPublished
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {listing.isPublished ? 'Published' : 'Unpublished'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleEdit(roomType.id)}
                      className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit Listing
                    </button>
                    <button
                      onClick={() => handleTogglePublish(roomType.id)}
                      className={`inline-flex items-center gap-1 ${
                        listing.isPublished
                          ? 'text-gray-600 hover:text-gray-800'
                          : 'text-green-600 hover:text-green-800'
                      }`}
                    >
                      {listing.isPublished ? (
                        <>
                          <ToggleLeft className="w-4 h-4" />
                          Unpublish
                        </>
                      ) : (
                        <>
                          <ToggleRight className="w-4 h-4" />
                          Publish
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleView(roomType.id)}
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
            <Globe className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No room types found</p>
          </div>
        )}
      </div>

      {/* Edit Website Listing Modal */}
      <FormModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedRoomTypeId(null);
        }}
        onSubmit={handleSaveEdit}
        title={`Edit Website Listing - ${selectedRoomType?.name}`}
        submitText="Save Changes"
        size="lg"
      >
        <div className="space-y-4">
          {/* PMS Info (Read-only) */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-xs font-medium text-gray-500 mb-2">PMS Room Type Information (Read-Only)</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Name:</span> <span className="font-medium text-gray-900">{selectedRoomType?.name}</span>
              </div>
              <div>
                <span className="text-gray-600">Base Price:</span> <span className="font-medium text-gray-900">${selectedRoomType?.basePrice}</span>
              </div>
              <div>
                <span className="text-gray-600">Capacity:</span> <span className="font-medium text-gray-900">{selectedRoomType?.capacity} guests</span>
              </div>
              <div>
                <span className="text-gray-600">Total Rooms:</span> <span className="font-medium text-gray-900">{selectedRoomType?.totalRooms}</span>
              </div>
            </div>
            <div className="mt-2">
              <span className="text-gray-600 text-sm">PMS Description:</span>
              <p className="text-sm text-gray-700 mt-1">{selectedRoomType?.description}</p>
            </div>
          </div>

          {/* Website-Specific Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Website Description</label>
            <textarea
              value={editForm.websiteDescription}
              onChange={(e) => setEditForm({ ...editForm, websiteDescription: e.target.value })}
              placeholder="Custom marketing description for the website..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Leave blank to use PMS description</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Website Photos (URLs)</label>
            <textarea
              value={editForm.websitePhotos}
              onChange={(e) => setEditForm({ ...editForm, websitePhotos: e.target.value })}
              placeholder="https://example.com/photo1.jpg&#10;https://example.com/photo2.jpg&#10;One URL per line"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">Enter one photo URL per line</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Promotional Rate ($)</label>
              <input
                type="number"
                step="0.01"
                value={editForm.promotionalRate}
                onChange={(e) => setEditForm({ ...editForm, promotionalRate: e.target.value })}
                placeholder="225.00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Promo Description</label>
              <input
                type="text"
                value={editForm.promotionalRateDescription}
                onChange={(e) => setEditForm({ ...editForm, promotionalRateDescription: e.target.value })}
                placeholder="Save 10%"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Featured Amenities</label>
            <input
              type="text"
              value={editForm.featuredAmenities}
              onChange={(e) => setEditForm({ ...editForm, featuredAmenities: e.target.value })}
              placeholder="Ocean View, Balcony, King Bed (comma-separated)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Highlight key selling points. Leave blank to use all PMS amenities.</p>
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

      {/* View Details Modal */}
      <FormModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedRoomTypeId(null);
        }}
        onSubmit={() => {
          setShowViewModal(false);
          setSelectedRoomTypeId(null);
        }}
        title={`${selectedRoomType?.name} - Details`}
        submitText="Close"
        size="lg"
      >
        {selectedRoomType && (
          <div className="space-y-6">
            {/* PMS Data */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">PMS Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Room Type ID</p>
                  <p className="font-medium text-gray-900">{selectedRoomType.id}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Total Rooms</p>
                  <p className="font-medium text-gray-900">{selectedRoomType.totalRooms}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Capacity</p>
                  <p className="font-medium text-gray-900">{selectedRoomType.capacity} guests</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Base Price</p>
                  <p className="font-medium text-gray-900">${selectedRoomType.basePrice}</p>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-1">Description</p>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedRoomType.description}</p>
              </div>
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-2">Amenities</p>
                <div className="flex flex-wrap gap-2">
                  {selectedRoomType.amenities.map((amenity, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Website Listing Data */}
            {selectedListing && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Website Listing</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      selectedListing.isPublished
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {selectedListing.isPublished ? 'Published' : 'Unpublished'}
                    </span>
                  </div>

                  {selectedListing.websiteDescription && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Custom Description</p>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedListing.websiteDescription}</p>
                    </div>
                  )}

                  {selectedListing.promotionalRate && (
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Promotional Offer</p>
                      <p className="text-lg font-bold text-orange-600">${selectedListing.promotionalRate}</p>
                      {selectedListing.promotionalRateDescription && (
                        <p className="text-sm text-gray-700">{selectedListing.promotionalRateDescription}</p>
                      )}
                    </div>
                  )}

                  {selectedListing.websitePhotos && selectedListing.websitePhotos.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Photos ({selectedListing.websitePhotos.length})</p>
                      <div className="space-y-1">
                        {selectedListing.websitePhotos.map((url, idx) => (
                          <div key={idx} className="text-xs text-gray-600 font-mono bg-gray-50 p-2 rounded break-all">
                            {url}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-gray-500">
                    Last updated: {new Date(selectedListing.lastUpdated).toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </FormModal>
    </div>
  );
}
