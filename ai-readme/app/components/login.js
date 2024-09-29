"use client";

import { useState } from 'react';
import Modal from './modal.js';
import { useUser } from './UserContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const { setUser } = useUser(); // Use the useUser hook to get setUser

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Set loading to true
    try {
      const response = await fetch('/api/firebase/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log('Logged in user:', data.user);
        setUser(data.user); // Update the user state globally
        setIsModalOpen(false); // Close the modal on successful login
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false); // Set loading to false
    }
  };

  return (
    <div className='loginContainer'>
      <button onClick={() => setIsModalOpen(true)}>Login</button>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <div>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Login;
