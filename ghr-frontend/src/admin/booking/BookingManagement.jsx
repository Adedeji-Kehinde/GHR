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

  // Styles
  const styles = {
    content: {
      marginTop: 40,
      margin: 40,
      padding: '2rem',
      width:"90vw",
      background: '#f8f9fa',
    },
    topBoxes: {
      display: 'flex',
      gap: 16,
      marginBottom: 24
    },
    box: selected => ({
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      padding: 16,
      borderRadius: 5,
      border: selected ? '2px solid #007bff' : '1px solid #ccc',
      background: '#fff',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      cursor: 'pointer',
      gap: 16,
      whiteSpace: 'nowrap'
    }),
    icon: {
      width: 40,
      height: 40,
      flexShrink: 0
    },
    textContainer: {
      display: 'flex',
      flexDirection: 'column',
      lineHeight: 1.2
    },
    title: {
      margin: 0,
      fontSize: 14,
      fontWeight: 'bold'
    },
    count: {
      margin: 0,
      fontSize: 18,
      color: '#333'
    },

    filterBar: {
      display: 'flex',
      gap: 16,
      marginBottom: 16,
      alignItems: 'center'
    },
    search: {
      width: '75%',
      padding: 8,
      fontSize: 14
    },
    availBtn: {
      width: '25%',
      padding: 8,
      fontSize: 14,
      background: '#007bff',
      color: '#fff',
      border: 'none',
      borderRadius: 4,
      cursor: 'pointer'
    },

    tableCard: {
      background: '#fff',
      borderRadius: 5,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      overflowY: 'auto',
      maxHeight: 400,
      padding: 16
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      textAlign: 'left',
      fontSize: 14
    },
    th: {
      padding: 8,
      borderBottom: '2px solid #ddd',
      fontWeight: 'bold'
    },
    td: {
      padding: 8,
      borderBottom: '1px solid #eee'
    }
  };

  // Add standardized status styles
  const statusStyles = {
    "Booked": {
      backgroundColor: '#e3f2fd',  // Light blue
      color: '#1976d2',
      padding: '4px 8px',
      borderRadius: '4px',
      fontWeight: 'bold'
    },
    "Cancelled": {
      backgroundColor: '#ffebee',  // Light red
      color: '#c62828',
      padding: '4px 8px',
      borderRadius: '4px',
      fontWeight: 'bold'
    },
    "Expired": {
      backgroundColor: '#fff3e0',  // Light orange
      color: '#e65100',
      padding: '4px 8px',
      borderRadius: '4px',
      fontWeight: 'bold'
    }
  };

  return (
    <>
      <AdminHeader
        title="Booking Management"
        adminName={`${adminUser.name} ${adminUser.lastName}`}
        profilePicture={adminUser.profileImageUrl}
      />
      <AdminTabs />

      <div style={styles.content}>
        {/* Top cards */}
        <div style={styles.topBoxes}>
          <div
            style={styles.box(viewMode==='bookings' && filterStatus==='All')}
            onClick={()=>{ setViewMode('bookings'); setFilterStatus('All'); }}
          >
            <img src={bookedIcon} alt="" style={styles.icon}/>
            <div style={styles.textContainer}>
              <p style={styles.title}>All</p>
              <p style={styles.count}>{countAll}</p>
            </div>
          </div>
          <div
            style={styles.box(viewMode==='bookings' && filterStatus==='Booked')}
            onClick={()=>{ setViewMode('bookings'); setFilterStatus('Booked'); }}
          >
            <img src={bookedIcon} alt="" style={styles.icon}/>
            <div style={styles.textContainer}>
              <p style={styles.title}>Booked</p>
              <p style={styles.count}>{countBooked}</p>
            </div>
          </div>
          <div
            style={styles.box(viewMode==='bookings' && filterStatus==='Expired')}
            onClick={()=>{ setViewMode('bookings'); setFilterStatus('Expired'); }}
          >
            <img src={bookedIcon} alt="" style={styles.icon}/>
            <div style={styles.textContainer}>
              <p style={styles.title}>Expired</p>
              <p style={styles.count}>{countExpired}</p>
            </div>
          </div>
          <div
            style={styles.box(viewMode==='bookings' && filterStatus==='Cancelled')}
            onClick={()=>{ setViewMode('bookings'); setFilterStatus('Cancelled'); }}
          >
            <img src={bookedIcon} alt="" style={styles.icon}/>
            <div style={styles.textContainer}>
              <p style={styles.title}>Cancelled</p>
              <p style={styles.count}>{countCancelled}</p>
            </div>
          </div>
        </div>

        {viewMode === 'availableRooms' ? (
          <AvailabilityFolderView treeData={availabilityTree}/>
        ) : (
          <>
            {/* Search + Availability */}
            <div style={styles.filterBar}>
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={styles.search}
              />
              <button
                style={styles.availBtn}
                onClick={() => setViewMode('availableRooms')}
              >
                Availability
              </button>
              {selectedBookings.length > 0 && (
                <img
                  src={deleteImage}
                  alt="Delete Selected"
                  onClick={deleteSelected}
                  style={{ width:24, height:24, cursor:'pointer' }}
                />
              )}
            </div>

            {/* Main bookings table */}
            <div style={styles.tableCard}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={filtered.length>0 && filtered.every(b=>selectedBookings.includes(b._id))}
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
                      style={{ cursor:'pointer' }}
                    >
                      <td onClick={e=>e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedBookings.includes(b._id)}
                          onChange={() => toggleSelectRow(b._id)}
                        />
                      </td>
                      <td style={styles.td}>{b.userName}</td>
                      <td style={styles.td}>
                       {`${b.buildingBlock}${b.floor}${String(b.apartmentNumber).padStart(2, '0')}${b.bedSpace}${b.bedNumber || ''}`}
                      </td>
                      <td style={styles.td}>{b.buildingBlock}</td>
                      <td style={styles.td}>{b.floor}</td>
                      <td style={styles.td}>{b.apartmentNumber}</td>
                      <td style={styles.td}>{b.bedSpace}</td>
                      <td style={styles.td}>{b.bedNumber || '-'}</td>
                      <td style={styles.td}>{b.roomType}</td>
                      <td style={styles.td}>
                        <span style={statusStyles[b.status] || {}}>
                          {b.status}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {b.checkInDate
                          ? moment(b.checkInDate).format('DD MMM YYYY, hh:mm A')
                          : '-'}
                      </td>
                      <td style={styles.td}>
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
