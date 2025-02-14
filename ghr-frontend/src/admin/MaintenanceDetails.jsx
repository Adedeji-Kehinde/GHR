// MaintenanceDetails.jsx
import React, { useState } from 'react';
import axios from 'axios';
import exitImage from '/images/exitImage.png';       // Your exit image
import deleteImage from '/images/deleteImage.png';   // Your delete image
import cancelImage from '/images/cancelImage.png';   // Image for cancel action
import saveImage from '/images/saveImage.png';       // Image for save action
import editImage from '/images/editImage.png';       // Image for edit action

const MaintenanceDetails = ({ maintenance: initialMaintenance, onClose, onUpdateDeleted }) => {
  const [maintenance, setMaintenance] = useState(initialMaintenance);
  const [editMode, setEditMode] = useState(false);
  const [updatedMaintenance, setUpdatedMaintenance] = useState(initialMaintenance);
  const [loading, setLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");

  // Handler for deleting the maintenance request
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this maintenance request?")) {
      try {
        setLoading(true);
        await axios.delete(`${API_URL}/api/maintenance/${maintenance._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (onUpdateDeleted) onUpdateDeleted();
        onClose();
      } catch (err) {
        console.error("Error deleting maintenance request:", err.response || err);
        alert("Error deleting maintenance request");
      } finally {
        setLoading(false);
      }
    }
  };

  // Handler for updating the maintenance request
  const handleUpdate = async () => {
    try {
      setLoading(true);
      const res = await axios.put(`${API_URL}/api/maintenance/${maintenance._id}`, updatedMaintenance, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMaintenance(res.data);
      setEditMode(false);
      if (onUpdateDeleted) onUpdateDeleted();
    } catch (err) {
      console.error("Error updating maintenance request:", err.response || err);
      alert("Error updating maintenance request");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedMaintenance({ ...updatedMaintenance, [name]: value });
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
              <select name={fieldName} value={updatedMaintenance[fieldName]} onChange={handleChange} style={{ width: '100%' }}>
                {options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input type="text" name={fieldName} value={updatedMaintenance[fieldName]} onChange={handleChange} style={{ width: '100%' }} />
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
            <h2 style={{ margin: 0 }}>Maintenance Details</h2>
            {!editMode && (
              <img 
                src={editImage} 
                alt="Edit" 
                onClick={() => setEditMode(true)}
                style={{ cursor: 'pointer', width: '25px', height: '25px', marginLeft: '0.5rem' }}
                title="Edit Request"
              />
            )}
          </div>
          <div>
            {editMode ? (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <img 
                  src={cancelImage} 
                  alt="Cancel" 
                  onClick={() => { setEditMode(false); setUpdatedMaintenance(maintenance); }}
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
                  title="Delete Request"
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
        {/* Content: Maintenance details arranged in two columns */}
        {renderField("Request ID", maintenance.requestId, "", false)}
        {renderField("Room Number", maintenance.roomNumber, "", false)}
        {renderField("Category", maintenance.category, "category", editMode, "select", [
          "Appliances", "Cleaning", "Plumbing & Leaking", "Heating", "Lighting", "Windows & Doors", "Furniture & Fitting", "Flooring", "Other"
        ])}
        {renderField("Description", maintenance.description, "description", editMode)}
        {renderField("Room Access", maintenance.roomAccess, "roomAccess", editMode, "select", ["Yes", "No"])}
        {renderField("Status", maintenance.status, "status", editMode, "select", ["In Process", "Completed"])}
        {renderField("Enquirer Name", maintenance.enquirerName, "", false)}
        {renderField("Created At", new Date(maintenance.createdAt).toLocaleString(), "", false)}
        {renderField("Completed At", maintenance.completedAt ? new Date(maintenance.completedAt).toLocaleString() : "N/A", "", false)}
      </div>
    </div>
  );
};

export default MaintenanceDetails;
