// DeliveryDetails.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminHeader from "../components/AdminHeader";
import AdminTabs from "../components/AdminTabs";
import './delivery.css';
import exitImage from '/images/exitImage.png';       // Your exit image
import deleteImage from '/images/deleteImage.png';   // Your delete image
import cancelImage from '/images/cancelImage.png';   // Image for cancel action
import saveImage from '/images/saveImage.png';       // Image for save action
import editImage from '/images/editImage.png';       // Image for edit action

const DeliveryDetails = ({ delivery: initialDelivery, onClose, onUpdateDeleted }) => {
  const [delivery, setDelivery] = useState(initialDelivery);
  const [editMode, setEditMode] = useState(false);
  const [updatedDelivery, setUpdatedDelivery] = useState(initialDelivery);
  const [loading, setLoading] = useState(false);
  const API_URL =import.meta.env.VITE_API_BASE_URL ||"http://localhost:8000";
  const token = localStorage.getItem("token");

  // Handler for deleting the delivery
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this delivery?")) {
      try {
        setLoading(true);
        await axios.delete(`${API_URL}/api/auth/deliveries/${delivery._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (onUpdateDeleted) onUpdateDeleted();
        onClose();
      } catch (err) {
        console.error("Error deleting delivery:", err.response || err);
        alert("Error deleting delivery");
      } finally {
        setLoading(false);
      }
    }
  };

  // Handler for updating the delivery
  const handleUpdate = async () => {
    try {
      setLoading(true);
      const res = await axios.put(`${API_URL}/api/auth/deliveries/${delivery._id}`, updatedDelivery, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Update both states to ensure the new status and other fields are reflected.
      setDelivery(res.data);
      setUpdatedDelivery(res.data);
      setEditMode(false);
      if (onUpdateDeleted) onUpdateDeleted();
      onClose(); // Close the modal after successful update
    } catch (err) {
      console.error("Error updating delivery:", err.response || err);
      alert("Error updating delivery");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedDelivery({ ...updatedDelivery, [name]: value });
  };

  // Styles matching other admin pages
  const styles = {
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    },
    modalContent: {
      backgroundColor: '#f8f9fa',
      padding: '2rem',
      borderRadius: '8px',
      position: 'relative',
      width: '90vw',
      maxWidth: '800px',
      maxHeight: '90vh',
      overflowY: 'auto'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
      padding: '1rem',
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    detailsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "1.5rem",
      marginBottom: "2rem",
      backgroundColor: "#fff",
      padding: "2rem",
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
    },
    detailBox: {
      padding: "1.5rem",
      backgroundColor: "#fff",
      borderRadius: "8px",
      border: "1px solid #dee2e6"
    },
    label: {
      fontWeight: "bold",
      marginBottom: "0.5rem",
      display: "block",
      color: "#495057"
    },
    value: {
      fontSize: "1rem",
      color: "#212529"
    },
    select: {
      width: "100%",
      padding: "0.5rem",
      borderRadius: "4px",
      border: "1px solid #ced4da",
      fontSize: "1rem"
    },
    input: {
      width: "100%",
      padding: "0.5rem",
      borderRadius: "4px",
      border: "1px solid #ced4da",
      fontSize: "1rem"
    },
    iconButton: {
      cursor: 'pointer',
      width: '30px',
      height: '30px',
      padding: '5px',
      borderRadius: '4px',
      backgroundColor: '#fff',
      border: '1px solid #dee2e6',
      transition: 'all 0.2s',
      '&:hover': {
        backgroundColor: '#f8f9fa'
      }
    }
  };

  // Status styles matching the main page
  const statusStyles = {
    "To Collect": {
      backgroundColor: '#fff3e0',  // Light orange
      color: '#e65100',
      padding: '4px 8px',
      borderRadius: '4px',
      fontWeight: 'bold'
    },
    "Collected": {
      backgroundColor: '#e8f5e9',  // Light green
      color: '#2e7d32',
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
    }
  };

  return (
    <div onClick={onClose} className="delivery-details-modal-overlay">
      <div onClick={(e) => e.stopPropagation()} className="delivery-details-modal-content">
        {/* Header */}
        <div className="delivery-details-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h2 style={{ margin: 0 }}>Delivery Details</h2>
            {!editMode && (
              <img 
                src={editImage} 
                alt="Edit" 
                onClick={() => setEditMode(true)}
                className="delivery-details-icon-button"
                title="Edit Delivery"
              />
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {editMode ? (
              <>
                <img 
                  src={cancelImage} 
                  alt="Cancel" 
                  onClick={() => { setEditMode(false); setUpdatedDelivery(delivery); }}
                  className="delivery-details-icon-button"
                  title="Cancel Editing"
                />
                <img 
                  src={saveImage} 
                  alt="Save" 
                  onClick={handleUpdate}
                  className="delivery-details-icon-button"
                  title="Save Changes"
                />
              </>
            ) : (
              <>
                <img 
                  src={deleteImage} 
                  alt="Delete" 
                  onClick={handleDelete}
                  className="delivery-details-icon-button"
                  title="Delete Delivery"
                />
                <img 
                  src={exitImage} 
                  alt="Close" 
                  onClick={onClose}
                  className="delivery-details-icon-button"
                  title="Close"
                />
              </>
            )}
          </div>
        </div>

        {/* Content Grid */}
        <div className="delivery-details-grid">
          {/* Parcel Number */}
          <div className="delivery-details-box">
            <div className="delivery-details-label">Parcel Number</div>
            <div className="delivery-details-value">{delivery.parcelNumber}</div>
          </div>

          {/* Sender */}
          <div className="delivery-details-box">
            <div className="delivery-details-label">Sender</div>
            {editMode ? (
              <input
                type="text"
                name="sender"
                value={updatedDelivery.sender}
                onChange={handleChange}
                className="delivery-details-input"
              />
            ) : (
              <div className="delivery-details-value">{delivery.sender}</div>
            )}
          </div>

          {/* Parcel Type */}
          <div className="delivery-details-box">
            <div className="delivery-details-label">Parcel Type</div>
            {editMode ? (
              <select
                name="parcelType"
                value={updatedDelivery.parcelType}
                onChange={handleChange}
                className="delivery-details-select"
              >
                <option value="Letter">Letter</option>
                <option value="Package">Package</option>
              </select>
            ) : (
              <div className="delivery-details-value">{delivery.parcelType}</div>
            )}
          </div>

          {/* Status */}
          <div className="delivery-details-box">
            <div className="delivery-details-label">Status</div>
            {editMode ? (
              <select
                name="status"
                value={updatedDelivery.status}
                onChange={handleChange}
                className="delivery-details-select"
              >
                <option value="To Collect">To Collect</option>
                <option value="Collected">Collected</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            ) : (
              <div className={`status-${delivery.status.toLowerCase().replace(' ', '-')}`}>
                {delivery.status}
              </div>
            )}
          </div>

          {/* Room Number */}
          <div className="delivery-details-box">
            <div className="delivery-details-label">Room Number</div>
            {editMode ? (
              <input
                type="text"
                name="roomNumber"
                value={updatedDelivery.roomNumber}
                onChange={handleChange}
                className="delivery-details-input"
              />
            ) : (
              <div className="delivery-details-value">{delivery.roomNumber}</div>
            )}
          </div>

          {/* Recipient Name */}
          <div className="delivery-details-box">
            <div className="delivery-details-label">Recipient Name</div>
            <div className="delivery-details-value">{delivery.recipientName}</div>
          </div>

          {/* Created At */}
          <div className="delivery-details-box">
            <div className="delivery-details-label">Created At</div>
            <div className="delivery-details-value">
              {new Date(delivery.arrivedAt).toLocaleString()}
            </div>
          </div>

          {/* Collected At */}
          <div className="delivery-details-box">
            <div className="delivery-details-label">Collected At</div>
            <div className="delivery-details-value">
              {delivery.collectedAt ? new Date(delivery.collectedAt).toLocaleString() : "N/A"}
            </div>
          </div>

          {/* Description */}
          <div className="delivery-details-box" style={{ gridColumn: '1 / -1' }}>
            <div className="delivery-details-label">Description</div>
            {editMode ? (
              <input
                type="text"
                name="description"
                value={updatedDelivery.description}
                onChange={handleChange}
                className="delivery-details-input"
              />
            ) : (
              <div className="delivery-details-value">{delivery.description}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDetails;
