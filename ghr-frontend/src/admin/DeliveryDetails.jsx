// DeliveryDetails.jsx
import React, { useState } from 'react';
import axios from 'axios';
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
  const API_URL = import.meta.env.VITE_API_BASE_URL;
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
      setDelivery(res.data);
      setEditMode(false);
      if (onUpdateDeleted) onUpdateDeleted();
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

  // Helper function to render a field row in two columns.
  const renderField = (label, value, fieldName, isEditable, type = "text", options = null) => {
    return (
      <div style={{ display: 'flex', marginBottom: '0.5rem' }}>
        <div style={{ width: '40%', textAlign: 'right', paddingRight: '1rem', fontWeight: 'bold' }}>
          {label}:
        </div>
        <div style={{ width: '60%', textAlign: 'left' }}>
          {isEditable ? (
            type === "select" ? (
              <select name={fieldName} value={updatedDelivery[fieldName]} onChange={handleChange} style={{ width: '100%' }}>
                {options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input type="text" name={fieldName} value={updatedDelivery[fieldName]} onChange={handleChange} style={{ width: '100%' }} />
            )
          ) : (
            value
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
      justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '1rem',
        borderRadius: '8px',
        position: 'relative',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {/* Header: Left section contains title and (in non‑edit mode) a small edit icon;
            Right section shows either delete/exit (non‑edit mode) or cancel/save (edit mode) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>Delivery Details</h2>
            {!editMode && (
              <img 
                src={editImage} 
                alt="Edit" 
                onClick={() => setEditMode(true)}
                style={{ cursor: 'pointer', width: '25px', height: '25px', marginLeft: '0.5rem' }}
                title="Edit Delivery"
              />
            )}
          </div>
          <div>
            {editMode ? (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <img 
                  src={cancelImage} 
                  alt="Cancel" 
                  onClick={() => { setEditMode(false); setUpdatedDelivery(delivery); }}
                  style={{ cursor: 'pointer', width: '30px', height: '30px' }}
                  title="Cancel Editing"
                />
                <img 
                  src={saveImage} 
                  alt="Save" 
                  onClick={handleUpdate}
                  style={{ cursor: 'pointer', width: '30px', height: '30px' }}
                  title="Save Changes"
                />
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <img 
                  src={deleteImage} 
                  alt="Delete" 
                  onClick={handleDelete}
                  style={{ cursor: 'pointer', width: '30px', height: '30px' }}
                  title="Delete Delivery"
                />
                <img 
                  src={exitImage} 
                  alt="Close" 
                  onClick={onClose}
                  style={{ cursor: 'pointer', width: '30px', height: '30px' }}
                  title="Close"
                />
              </div>
            )}
          </div>
        </div>

        {/* Content: Delivery details arranged in two columns */}
        {renderField("Parcel Number", delivery.parcelNumber, "", false)}
        {renderField("Sender", delivery.sender, "sender", editMode)}
        {renderField("Parcel Type", delivery.parcelType, "parcelType", editMode, "select", ["Letter", "Package"])}
        {renderField("Description", delivery.description, "description", editMode)}
        {renderField("Status", delivery.status, "status", editMode, "select", ["To Collect", "Collected", "Cancelled"])}
        {renderField("Room Number", delivery.roomNumber, "roomNumber", editMode)}
        {renderField("Recipient Name", delivery.recipientName, "", false)}
        {renderField("Created At", new Date(delivery.arrivedAt).toLocaleString(), "", false)}
        {renderField("Collected At", delivery.collectedAt ? new Date(delivery.collectedAt).toLocaleString() : "N/A", "", false)}
      </div>
    </div>
  );
};

export default DeliveryDetails;
