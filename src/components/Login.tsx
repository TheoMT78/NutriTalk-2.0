import React, { useState } from 'react';
import { User } from '../types';
import { login, register } from '../utils/api';

interface LoginProps {
  user: User;
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ user, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(!user.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSignup) {
        const newUser = await register({ ...user, email, password });
        onLogin(newUser);
      } else {
        const logged = await login(email, password);
        onLogin(logged);
      }
    } catch {
      alert('Email ou mot de passe incorrect');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg space-y-4 shadow-md w-80">
        <h2 className="text-xl font-bold text-center">
          {isSignup ? 'Créer un compte' : 'Connexion'}
        </h2>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
        >
          {isSignup ? 'Créer le compte' : 'Se connecter'}
        </button>
        <button
          type="button"
          onClick={() => setIsSignup(!isSignup)}
          className="text-sm underline block mx-auto"
        >
          {isSignup ? 'J\'ai déjà un compte' : 'Créer un compte'}
        </button>
      </form>
    </div>
  );
};

export default Login;
