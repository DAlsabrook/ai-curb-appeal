// components/Login.js
import { useState } from 'react';
import { loginUser } from '../firebase/auth'; //REMOVE THIS. Create a route to handle login
import Modal from './modal.js';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const user = await loginUser(email, password);
      console.log('Logged in user:', user);
      // Handle successful login (e.g., redirect to dashboard)
      setIsModalOpen(false); // Close the modal on successful login
    } catch (error) {
      setError(error.message);
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
          <button type="submit">Login</button>
        </form>
      </Modal>
    </div>
  );
};

export default Login;
