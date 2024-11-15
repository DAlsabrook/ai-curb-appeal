"use client";

import { useState } from 'react';
import Modal from './modal.js';
import { useUser } from './UserContext.js';

const Admin = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useUser(); // Access the user context

  return (
    <div className='adminContainer'>
      <button onClick={() => setIsModalOpen(true)}>Admin</button>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <p>Global context User:</p>
        {user ? (
          <div>
            {Object.keys(user).map((key) => (
              <div key={key}>
                <strong>{key.toUpperCase()}:</strong> {Array.isArray(user[key]) ? (
                  <ul>
                    {user[key].map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <span>{user[key]}</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>No user logged in</p>
        )}
      </Modal>
    </div>
  );
};

export default Admin;
