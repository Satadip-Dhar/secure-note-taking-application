import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Pagination from '../components/Pagination';

const Posts = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingPostId, setEditingPostId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const fetchPosts = useCallback(async (targetPage = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/posts?page=${targetPage}&limit=5`);
      setPosts(res.data.data);
      setPagination(res.data.pagination);
      setPage(res.data.pagination.page);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(page);
  }, [fetchPosts, page]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      await api.post('/posts', { title, content });
      setTitle('');
      setContent('');
      fetchPosts(1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
    }
  };

  const handleStartEdit = (post) => {
    setEditingPostId(post._id);
    setEditTitle(post.title);
    setEditContent(post.content);
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditTitle('');
    setEditContent('');
  };

  const handleUpdatePost = async (postId) => {
    try {
      await api.put(`/posts/${postId}`, {
        title: editTitle,
        content: editContent,
      });
      setEditingPostId(null);
      fetchPosts(page);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update post');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.delete(`/posts/${postId}`);
      fetchPosts(page);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete post');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '24px auto', padding: '0 16px' }}>
      <h2>Community Posts</h2>
      <p style={{ color: '#4b5563' }}>Posts are visible to all users in the system.</p>

      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '10px', borderRadius: '4px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', marginBottom: '24px', backgroundColor: '#f9fafb' }}>
        <h3>Create New Post</h3>
        <form onSubmit={handleCreatePost}>
          <div style={{ marginBottom: '12px' }}>
            <input
              type="text"
              placeholder="Post Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <textarea
              placeholder="Post Content..."
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
            Publish Post
          </button>
        </form>
      </div>

      <h3>All Posts</h3>

      {loading ? (
        <p>Loading posts...</p>
      ) : posts.length === 0 ? (
        <p>No posts published yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {posts.map((post) => {
            const isEditing = editingPostId === post._id;
            const isAuthor = post.userId?._id === user?._id || post.userId === user?._id;
            const canManage = isAuthor || user?.role === 'admin';

            return (
              <div
                key={post._id}
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
                        onClick={() => handleUpdatePost(post._id)}
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
                      <h4 style={{ margin: '0 0 8px 0' }}>{post.title}</h4>
                      {canManage && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleStartEdit(post)}
                            style={{ padding: '4px 8px', backgroundColor: '#f59e0b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeletePost(post._id)}
                            style={{ padding: '4px 8px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                    <p style={{ margin: '0 0 12px 0', whiteSpace: 'pre-wrap', color: '#374151' }}>{post.content}</p>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      <span>
                        Posted by: <strong>{post.userId?.name || 'Unknown'}</strong> ({post.userId?.email || ''}) |{' '}
                      </span>
                      <span>Published: {new Date(post.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Pagination pagination={pagination} onPageChange={(newPage) => fetchPosts(newPage)} />
    </div>
  );
};

export default Posts;
