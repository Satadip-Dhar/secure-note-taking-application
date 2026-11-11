import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Pagination from '../components/Pagination';

const AdminPanel = () => {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('user');
  const [newInterests, setNewInterests] = useState('');

  const [editingUserId, setEditingUserId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('user');
  const [editInterests, setEditInterests] = useState('');

  const fetchUsers = useCallback(async (targetPage = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/users?page=${targetPage}&limit=5`);
      setUsers(res.data.data);
      setPagination(res.data.pagination);
      setPage(res.data.pagination.page);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(page);
  }, [fetchUsers, page]);

  const handleAddUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post('/users', {
        name: newName,
        email: newEmail,
        password: newPassword,
        role: newRole,
        interests: newInterests.split(',').map((i) => i.trim()).filter(Boolean),
      });

      setSuccess('User created successfully');
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      setNewRole('user');
      setNewInterests('');
      fetchUsers(1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    }
  };

  const handleStartEdit = (user) => {
    setEditingUserId(user._id);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditInterests((user.interests || []).join(', '));
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditName('');
    setEditEmail('');
    setEditRole('user');
    setEditInterests('');
  };

  const handleUpdateUser = async (userId) => {
    setError('');
    setSuccess('');
    try {
      await api.put(`/users/${userId}`, {
        name: editName,
        email: editEmail,
        role: editRole,
        interests: editInterests.split(',').map((i) => i.trim()).filter(Boolean),
      });

      setSuccess('User updated successfully');
      setEditingUserId(null);
      fetchUsers(page);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user and all their notes/posts?')) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/users/${userId}`);
      setSuccess('User deleted successfully');
      fetchUsers(page);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '24px auto', padding: '0 16px' }}>
      <h2>Admin Panel: User Management</h2>

      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '10px', borderRadius: '4px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '10px', borderRadius: '4px', marginBottom: '16px' }}>
          {success}
        </div>
      )}

      <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', marginBottom: '24px', backgroundColor: '#f9fafb' }}>
        <h3>Add New User</h3>
        <form onSubmit={handleAddUser}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <input
              type="text"
              placeholder="Full Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
              style={{ padding: '8px' }}
            />
            <input
              type="email"
              placeholder="Email Address"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
              style={{ padding: '8px' }}
            />
            <input
              type="password"
              placeholder="Password (min 6 chars)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              style={{ padding: '8px' }}
            />
            <select value={newRole} onChange={(e) => setNewRole(e.target.value)} style={{ padding: '8px' }}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <input
              type="text"
              placeholder="Interests (comma-separated, e.g. chess, reading, coding)"
              value={newInterests}
              onChange={(e) => setNewInterests(e.target.value)}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
          <button
            type="submit"
            style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Create User
          </button>
        </form>
      </div>

      <h3>User Directory</h3>

      {loading ? (
        <p>Loading users...</p>
      ) : users.length === 0 ? (
        <p>No users registered yet.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', backgroundColor: '#fff', border: '1px solid #e5e7eb' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '10px' }}>Name</th>
                <th style={{ padding: '10px' }}>Email</th>
                <th style={{ padding: '10px' }}>Role</th>
                <th style={{ padding: '10px' }}>Interests</th>
                <th style={{ padding: '10px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isEditing = editingUserId === u._id;
                const isSelf = currentAdmin?._id === u._id;

                return isEditing ? (
                  <tr key={u._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '10px' }}>
                      <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} style={{ width: '100%', padding: '4px' }} />
                    </td>
                    <td style={{ padding: '10px' }}>
                      <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} style={{ width: '100%', padding: '4px' }} />
                    </td>
                    <td style={{ padding: '10px' }}>
                      <select value={editRole} onChange={(e) => setEditRole(e.target.value)} style={{ padding: '4px' }}>
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td style={{ padding: '10px' }}>
                      <input type="text" value={editInterests} onChange={(e) => setEditInterests(e.target.value)} style={{ width: '100%', padding: '4px' }} />
                    </td>
                    <td style={{ padding: '10px' }}>
                      <button onClick={() => handleUpdateUser(u._id)} style={{ padding: '4px 8px', marginRight: '6px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Save
                      </button>
                      <button onClick={handleCancelEdit} style={{ padding: '4px 8px', backgroundColor: '#9ca3af', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Cancel
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr key={u._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '10px' }}>{u.name}</td>
                    <td style={{ padding: '10px' }}>{u.email}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '12px', backgroundColor: u.role === 'admin' ? '#fef3c7' : '#e0f2fe', color: u.role === 'admin' ? '#92400e' : '#0369a1' }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '10px' }}>
                      {(u.interests || []).length > 0 ? u.interests.join(', ') : <span style={{ color: '#9ca3af' }}>None</span>}
                    </td>
                    <td style={{ padding: '10px' }}>
                      <button onClick={() => handleStartEdit(u)} style={{ padding: '4px 8px', marginRight: '6px', backgroundColor: '#f59e0b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Edit
                      </button>
                      {!isSelf && (
                        <button onClick={() => handleDeleteUser(u._id)} style={{ padding: '4px 8px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Pagination pagination={pagination} onPageChange={(newPage) => fetchUsers(newPage)} />
    </div>
  );
};

export default AdminPanel;
