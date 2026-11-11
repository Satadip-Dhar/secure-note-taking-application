import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Pagination from '../components/Pagination';

const Notes = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const fetchNotes = useCallback(async (targetPage = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/notes?page=${targetPage}&limit=5`);
      setNotes(res.data.data);
      setPagination(res.data.pagination);
      setPage(res.data.pagination.page);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes(page);
  }, [fetchNotes, page]);

  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      await api.post('/notes', { title, content });
      setTitle('');
      setContent('');
      fetchNotes(1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create note');
    }
  };

  const handleStartEdit = (note) => {
    setEditingNoteId(note._id);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditTitle('');
    setEditContent('');
  };

  const handleUpdateNote = async (noteId) => {
    try {
      await api.put(`/notes/${noteId}`, {
        title: editTitle,
        content: editContent,
      });
      setEditingNoteId(null);
      fetchNotes(page);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update note');
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    try {
      await api.delete(`/notes/${noteId}`);
      fetchNotes(page);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete note');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '24px auto', padding: '0 16px' }}>
      <h2>{user?.role === 'admin' ? 'Notes Management (Admin: All Notes)' : 'My Notes'}</h2>

      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '10px', borderRadius: '4px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', marginBottom: '24px', backgroundColor: '#f9fafb' }}>
        <h3>Create New Note</h3>
        <form onSubmit={handleCreateNote}>
          <div style={{ marginBottom: '12px' }}>
            <input
              type="text"
              placeholder="Note Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <textarea
              placeholder="Note Content..."
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
          <button
            type="submit"
            style={{ padding: '8px 16px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Add Note
          </button>
        </form>
      </div>

      <h3>Existing Notes</h3>

      {loading ? (
        <p>Loading notes...</p>
      ) : notes.length === 0 ? (
        <p>No notes found.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notes.map((note) => {
            const isEditing = editingNoteId === note._id;
            const isOwner = note.userId?._id === user?._id || note.userId === user?._id;
            const canManage = isOwner || user?.role === 'admin';

            return (
              <div
                key={note._id}
                style={{
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  padding: '16px',
                  backgroundColor: '#ffffff',
                }}
              >
                {isEditing ? (
                  <div>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      style={{ width: '100%', padding: '8px', marginBottom: '8px', boxSizing: 'border-box' }}
                    />
                    <textarea
                      rows={3}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      style={{ width: '100%', padding: '8px', marginBottom: '8px', boxSizing: 'border-box' }}
                    />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleUpdateNote(note._id)}
                        style={{ padding: '6px 12px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        style={{ padding: '6px 12px', backgroundColor: '#9ca3af', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ margin: '0 0 8px 0' }}>{note.title}</h4>
                      {canManage && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleStartEdit(note)}
                            style={{ padding: '4px 8px', backgroundColor: '#f59e0b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note._id)}
                            style={{ padding: '4px 8px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                    <p style={{ margin: '0 0 12px 0', whiteSpace: 'pre-wrap', color: '#374151' }}>{note.content}</p>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {user?.role === 'admin' && (
                        <span>
                          Author: <strong>{note.userId?.name || 'Unknown'}</strong> ({note.userId?.email || ''}) |{' '}
                        </span>
                      )}
                      <span>Created: {new Date(note.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Pagination pagination={pagination} onPageChange={(newPage) => fetchNotes(newPage)} />
    </div>
  );
};

export default Notes;
