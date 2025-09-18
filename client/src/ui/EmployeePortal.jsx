import React, { useEffect, useState } from 'react';

export function EmployeePortal({ api }) {
  console.log('[EmployeePortal] render');
  const [profile, setProfile] = useState({ id: '', name: '', phoneNumber: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [employeeId, setEmployeeId] = useState(localStorage.getItem('identifier') || '');

  const load = async () => {
    console.log('[EmployeePortal] load start');
    if (!employeeId) return;
    const [p, t] = await Promise.all([api.getEmployeeProfile(employeeId), api.listEmployeeTasks(employeeId)]);
    console.log('[EmployeePortal] load result', p, t);
    setProfile(p || { id: employeeId, name: '', phoneNumber: '', email: '' });
    setTasks(t || []);
  };

  useEffect(() => {
    load();
  }, []);

  const saveProfile = async () => {
    console.log('[EmployeePortal] saveProfile start', profile);
    setSaving(true);
    await api.updateEmployeeProfile(employeeId, { name: profile.name });
    setSaving(false);
  };

  const markDone = async (taskId) => {
    console.log('[EmployeePortal] markDone', taskId);
    await api.updateTaskStatus(taskId, employeeId, 'completed');
    load();
  };

  return (
    <div style={{ marginTop: 16 }}>
      <h3>My Profile</h3>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <input placeholder="Name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
        <input placeholder="Phone" value={profile.phoneNumber} onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })} />
        <input placeholder="Email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
        <button onClick={saveProfile} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
      </div>
      <h3>My Tasks</h3>
      <ul>
        {tasks.map((t) => (
          <li key={t.id}>
            {t.title} {t.done ? '(Done)' : ''}
            {!t.done && (
              <button style={{ marginLeft: 8 }} onClick={() => markDone(t.id)}>Done</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}



