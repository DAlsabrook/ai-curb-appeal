"use client";

import React, { useState, useEffect } from 'react';
import '../styles/modal.css';

const Modal = ({ isOpen, onClose, children }) => {
  const [isVisible, setIsVisible] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 200); // Match the duration of the fade-out animation
  };

  if (!isVisible && !isOpen) return null;

  return (
    <div className={`modal-overlay `}>
      <div className={`modal-content ${isOpen ? 'fade-in-grow' : ''}`}>
        <button className="modal-close" onClick={handleClose}>close</button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
