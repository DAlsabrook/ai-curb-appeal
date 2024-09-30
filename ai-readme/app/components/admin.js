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
        <button onClick={() => {
          console.log("User from context:")
          console.log(user)
        }}>Log User</button>
      </Modal>
    </div>
  );
};

export default Admin;
