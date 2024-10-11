"use client";

import { useState } from 'react';
import Modal from './modal.js';
import { useUser } from './UserContext';

const Admin = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, setUser } = useUser(); // Use the useUser hook to get setUser

  return (
    <div className='adminContainer'>
      <button onClick={() => setIsModalOpen(true)}>Admin</button>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <p>Global context User:</p>
        {user && (
          <div>
            <p>UID: {user.uid}</p>
            <p>CREDITS: {user.credits}</p>
            <p>MODELS:</p>
            <ul>
              {user && user.models && user.models.length > 0 ? (
                user.models.map((model, index) => (
                  <li key={index}>{model}</li>
                ))
              ) : (
                <li>No models available</li>
              )}
            </ul>
          </div>
          )}
      </Modal>
    </div>
  );
};

export default Admin;
