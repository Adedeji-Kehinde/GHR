import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import moment from 'moment';
import AdminHeader from "../components/AdminHeader";
import AdminTabs from "../components/AdminTabs";
import { useNavigate } from 'react-router-dom';
import deleteImage from '/images/deleteImage.png';
import bookedIcon from '/images/booked.png';
import AvailabilityFolderView from './AvailabilityFolderView';
import Loading from '../../pages/components/Loading';
import './booking.css';

const BookingManagement = () => {
  const [adminUser, setAdminUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All'); // All | Booked | Expired | Cancelled
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('bookings');    // bookings | availableRooms

  const [allAvailability, setAllAvailability] = useState({});
  const [availabilityTree, setAvailabilityTree] = useState({});

  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  const token   = localStorage.getItem('token');
  const navigate = useNavigate();

  // Fetch admin user
  useEffect(() => {
    axios.get(`${API_URL}/api/auth/user`, { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => setAdminUser(data))
      .catch(console.error);
  }, []);

  // Fetch bookings
  useEffect(() => {
    axios.get(`${API_URL}/api/booking/bookings`, { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => {
        setBookings(data.map(b => ({
          ...b,
          userName: b.userId ? `${b.userId.name} ${b.userId.lastName}` : 'Unknown',
          userRoom: b.userId ? b.userId.roomNumber : '–'
        })));
      })
      .catch(console.error);
  }, []);

  // Fetch availability when toggled
  useEffect(() => {
    if (viewMode === 'availableRooms') {
      axios.get(`${API_URL}/api/booking/rooms-available`, { headers: { Authorization: `Bearer ${token}` } })
        .then(({ data }) => {
          setAllAvailability(data.availability);
          setAvailabilityTree(transformAvailabilityData(data.availability));
        })
        .catch(console.error);
    }
  }, [viewMode]);

  const transformAvailabilityData = availabilityData => {
    const tree = {};
    Object.entries(availabilityData).forEach(([block, data]) => {
      tree[block] = {};
      data.rooms.forEach(r => {
        const { floor, apartmentNumber, roomType, bedSpace, bedNumber } = r;
        tree[block][floor] ??= {};
        tree[block][floor][apartmentNumber] ??= {};
        tree[block][floor][apartmentNumber][roomType] ??= {};
        tree[block][floor][apartmentNumber][roomType][bedSpace] ??= [];
        tree[block][floor][apartmentNumber][roomType][bedSpace].push(bedNumber);
      });
    });
    return tree;
  };

  // Filtered & searched bookings, most‑recent first
  const filtered = useMemo(() => bookings
    .filter(b => filterStatus === 'All' || b.status === filterStatus)
    .filter(b =>
      b.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.userRoom.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => a._id < b._id ? 1 : -1)
  , [bookings, filterStatus, searchQuery]);

  // Selection handlers
  const toggleSelectRow = id =>
    setSelectedBookings(sel =>
      sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id]
    );
  const toggleSelectAll = () => {
    const ids = filtered.map(b => b._id);
    const all = ids.every(id => selectedBookings.includes(id));
    setSelectedBookings(all ? [] : ids);
  };
  const deleteSelected = () => {
       if (!selectedBookings.length) {
         alert('No bookings selected.');
         return;
       }
       if (!window.confirm('Are you sure you want to delete the selected bookings?')) {
         return;
       }
       Promise.all(
         selectedBookings.map(id =>
           axios.delete(`${API_URL}/api/booking/bookings/${id}`, {
             headers: { Authorization: `Bearer ${token}` }
           })
         )
       )
       .then(() => {
         alert('Selected bookings deleted successfully!');
         // Redirect back here to refresh
         navigate('/booking-management');
       })
       .catch(err => {
         console.error(err);
         alert('Error deleting bookings.');
       });
     };
  const goDetails = b => navigate('/booking-details', { state: { booking: b } });

  if (!adminUser) return <Loading icon="/images/bookings.png" text="Loading Your booking details..." />;

  // Counts for top cards
  const countAll       = bookings.length;
  const countBooked    = bookings.filter(b => b.status==='Booked').length;
  const countExpired   = bookings.filter(b => b.status==='Expired').length;
  const countCancelled = bookings.filter(b => b.status==='Cancelled').length;

  return (
    <>
      <AdminHeader
        title="Booking Management"
        adminName={`${adminUser.name} ${adminUser.lastName}`}
        profilePicture={adminUser.profileImageUrl}
      />
      <AdminTabs />

      <div className="booking-management-content">
        {/* Top cards */}
        <div className="booking-management-top-boxes">
          <div
            className={`booking-management-box ${viewMode === 'bookings' && filterStatus === 'All' ? 'selected' : ''}`}
            onClick={() => { setViewMode('bookings'); setFilterStatus('All'); }}
          >
            <img src={bookedIcon} alt="" className="booking-management-icon" />
            <div className="booking-management-text-container">
              <p className="booking-management-title">All</p>
              <p className="booking-management-count">{countAll}</p>
            </div>
          </div>
          <div
            className={`booking-management-box ${viewMode === 'bookings' && filterStatus === 'Booked' ? 'selected' : ''}`}
            onClick={() => { setViewMode('bookings'); setFilterStatus('Booked'); }}
          >
            <img src={bookedIcon} alt="" className="booking-management-icon" />
            <div className="booking-management-text-container">
              <p className="booking-management-title">Booked</p>
              <p className="booking-management-count">{countBooked}</p>
            </div>
          </div>
          <div
            className={`booking-management-box ${viewMode === 'bookings' && filterStatus === 'Expired' ? 'selected' : ''}`}
            onClick={() => { setViewMode('bookings'); setFilterStatus('Expired'); }}
          >
            <img src={bookedIcon} alt="" className="booking-management-icon" />
            <div className="booking-management-text-container">
              <p className="booking-management-title">Expired</p>
              <p className="booking-management-count">{countExpired}</p>
            </div>
          </div>
          <div
            className={`booking-management-box ${viewMode === 'bookings' && filterStatus === 'Cancelled' ? 'selected' : ''}`}
            onClick={() => { setViewMode('bookings'); setFilterStatus('Cancelled'); }}
          >
            <img src={bookedIcon} alt="" className="booking-management-icon" />
            <div className="booking-management-text-container">
              <p className="booking-management-title">Cancelled</p>
              <p className="booking-management-count">{countCancelled}</p>
            </div>
          </div>
        </div>

        {viewMode === 'availableRooms' ? (
          <AvailabilityFolderView treeData={availabilityTree} />
        ) : (
          <>
            {/* Search + Availability */}
            <div className="booking-management-filter-bar">
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="booking-management-search"
              />
              <button
                className="booking-management-avail-btn"
                onClick={() => setViewMode('availableRooms')}
              >
                Availability
              </button>
              {selectedBookings.length > 0 && (
                <img
                  src={deleteImage}
                  alt="Delete Selected"
                  onClick={deleteSelected}
                  className="booking-management-action-icon"
                />
              )}
            </div>

            {/* Main bookings table */}
            <div className="booking-management-table-card">
              <table className="booking-management-table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={filtered.length > 0 && filtered.every(b => selectedBookings.includes(b._id))}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th>Occupant</th>
                    <th>Room</th>
                    <th>Block</th>
                    <th>Floor</th>
                    <th>Apartment</th>
                    <th>Space</th>
                    <th>Bed #</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Check‑In</th>
                    <th>Check‑Out</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(b => (
                    <tr
                      key={b._id}
                      onClick={() => goDetails(b)}
                      className="booking-management-row"
                    >
                      <td onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedBookings.includes(b._id)}
                          onChange={() => toggleSelectRow(b._id)}
                        />
                      </td>
                      <td className="booking-management-td">{b.userName}</td>
                      <td className="booking-management-td">
                        {`${b.buildingBlock}${b.floor}${String(b.apartmentNumber).padStart(2, '0')}${b.bedSpace}${b.bedNumber || ''}`}
                      </td>
                      <td className="booking-management-td">{b.buildingBlock}</td>
                      <td className="booking-management-td">{b.floor}</td>
                      <td className="booking-management-td">{b.apartmentNumber}</td>
                      <td className="booking-management-td">{b.bedSpace}</td>
                      <td className="booking-management-td">{b.bedNumber || '-'}</td>
                      <td className="booking-management-td">{b.roomType}</td>
                      <td className="booking-management-td">
                        <span className={`booking-management-status ${b.status.toLowerCase()}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="booking-management-td">
                        {b.checkInDate
                          ? moment(b.checkInDate).format('DD MMM YYYY, hh:mm A')
                          : '-'}
                      </td>
                      <td className="booking-management-td">
                        {b.checkOutDate
                          ? moment(b.checkOutDate).format('DD MMM YYYY, hh:mm A')
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default BookingManagement;
