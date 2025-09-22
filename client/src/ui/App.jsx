import React, { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { ApiClientFactory } from '../utils/apiClientFactory.js';
import { ChatPanel } from './ChatPanel.jsx';
import { EmployeeDashboard } from './EmployeeDashboard.jsx';
import { EmployeePortal } from './EmployeePortal.jsx';
import { AuthForm } from './AuthForm.jsx';
import { Layout } from './Layout.jsx';

// Create API client via factory (easily swappable for mocks/tests)
const api = ApiClientFactory.create();

export default function App() {
  console.log('[App] render start');
  const [identifier, setIdentifier] = useState(localStorage.getItem('identifier') || '');
  const [role, setRole] = useState(localStorage.getItem('role') || 'owner');
  const [socketConnected, setSocketConnected] = useState(false);
  const [section, setSection] = useState('employees');

  const socket = useMemo(() => {
    console.log('[App] initializing socket');
    // Use environment variable for socket URL, fallback to current origin for development
    const socketURL = import.meta.env.VITE_SOCKET_URL || window.location.origin;
    return io(socketURL, { path: '/socket.io' });
  }, []);

  useEffect(() => {
    console.log('[App] effect: socket listeners setup');
    socket.on('connect', () => {
      console.log('[Socket] connected', socket.id);
      setSocketConnected(true);
    });
    socket.on('disconnect', () => {
      console.log('[Socket] disconnected');
      setSocketConnected(false);
    });
    return () => {
      console.log('[App] cleanup: socket off');
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [socket]);

  const handleAuthSuccess = (id, selectedRole) => {
    console.log('[App] handleAuthSuccess', id, selectedRole);
    setIdentifier(id);
    setRole(selectedRole);
    localStorage.setItem('identifier', id);
    localStorage.setItem('role', selectedRole);
  };

  console.log('[App] render body', { identifier, role, socketConnected });
  return (
    <div style={{ padding: 0 }}>
      {!identifier ? (
        <AuthForm api={api} onSuccess={handleAuthSuccess} />
      ) : (
        <Layout section={section} onNavigate={setSection} title="Real-Time Employee Task Manager">
          {role === 'owner' && section === 'employees' && <EmployeeDashboard api={api} />}
          {section === 'messages' && <ChatPanel socket={socket} api={api} phoneNumber={identifier} />}
          {role !== 'owner' && section !== 'messages' && <EmployeePortal api={api} />}
        </Layout>
      )}
    </div>
  );
}
