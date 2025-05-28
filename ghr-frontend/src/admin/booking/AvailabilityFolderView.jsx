import React, { useState } from 'react';
import './booking.css';

// Import your images. Adjust paths as needed.
import buildingBlockIcon from '/images/building-block.png';
import floorIcon from '/images/floor.png';
import apartmentIcon from '/images/apartment.png';
import ensuiteIcon from '/images/ensuite.png';
import twinSharedIcon from '/images/twin-shared.png';
import roomIcon from '/images/room.png'; 
import bedIcon from '/images/bed.png';

// Recursive component to render each node as a box in a folder-style dropdown.
const FolderTree = ({ data, label, level }) => {
  const [expanded, setExpanded] = useState(false);

  // Determine if the node is an object (has children) or is an array (leaf items)
  const isObject = data && typeof data === 'object' && !Array.isArray(data);
  const isArray = Array.isArray(data);

  const toggle = () => {
    setExpanded(!expanded);
  };

  // Set display label based on level.
  let displayLabel = label;
  if (level === 1) {
    displayLabel = `Floor ${label}`;
  } else if (level === 2) {
    displayLabel = `Apartment ${label}`;
  } else if (level === 3) {
    displayLabel = `Room Type - ${label}`;
  } else if (level === 4) {
    displayLabel = `Room - ${label}`;
  }
  // Level 0 already comes in as "Building Block X" from the parent.

  // Choose an icon based on level.
  let icon;
  if (level === 0) {
    icon = buildingBlockIcon;
  } else if (level === 1) {
    icon = floorIcon;
  } else if (level === 2) {
    icon = apartmentIcon;
  } else if (level === 3) {
    // At the room type level, choose icon based on the text.
    if (label.toLowerCase().includes('ensuite')) {
      icon = ensuiteIcon;
    } else if (label.toLowerCase().includes('twin')) {
      icon = twinSharedIcon;
    } else {
      icon = ensuiteIcon; // default
    }
  } else if (level === 4 ) {
    icon = roomIcon;
  }

  return (
    <div className="availability-folder-view">
      <div className="availability-folder-box" onClick={toggle}>
        <img src={icon} alt="icon" className="availability-folder-icon" />
        <span>{displayLabel}</span>
      </div>
      {expanded && isObject && (
        <div>
          {Object.entries(data).map(([childKey, childData]) => (
            <FolderTree
              key={childKey}
              data={childData}
              label={childKey}
              level={level + 1}
            />
          ))}
        </div>
      )}
      {expanded && isArray && (
        <div className="availability-folder-array">
          {data.map((item, index) => (
            <div key={index} className="availability-folder-box">
              <img src={bedIcon} alt="bed" className="availability-folder-icon" />
              <span>{`Bed Number - ${item}`}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AvailabilityFolderView = ({ treeData }) => {
  return (
    <div style={{ padding: '1rem' }}>
      {Object.entries(treeData).map(([blockKey, blockData]) => (
        <FolderTree
          key={blockKey}
          data={blockData}
          label={`Building Block ${blockKey}`}
          level={0}
        />
      ))}
    </div>
  );
};

export default AvailabilityFolderView;
