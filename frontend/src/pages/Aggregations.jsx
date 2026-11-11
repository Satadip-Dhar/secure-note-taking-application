import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Aggregations = () => {
  const { user } = useAuth();

  const [interestsData, setInterestsData] = useState([]);
  const [loadingInterests, setLoadingInterests] = useState(false);
  const [interestsError, setInterestsError] = useState('');

  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(user?._id || '');
  const [customIdInput, setCustomIdInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const [userPostsData, setUserPostsData] = useState(null);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [postsError, setPostsError] = useState('');

  const fetchUsersByInterests = async () => {
    setLoadingInterests(true);
    setInterestsError('');
    try {
      const res = await api.get('/aggregations/users-by-interests');
      const data = res.data.data || [];
      setInterestsData(data);

      const userMap = new Map();
      if (user?._id) {
        userMap.set(user._id, { _id: user._id, name: `${user.name} (You)`, email: user.email });
      }
      data.forEach((group) => {
        (group.users || []).forEach((u) => {
          if (!userMap.has(u._id)) {
            userMap.set(u._id, u);
          }
        });
      });
      setAvailableUsers(Array.from(userMap.values()));
    } catch (err) {
      setInterestsError(err.response?.data?.message || 'Failed to load community interests');
    } finally {
      setLoadingInterests(false);
    }
  };

  const fetchUserPosts = async (targetId) => {
    const idToFetch = targetId || selectedUserId;
    if (!idToFetch) return;

    setLoadingPosts(true);
    setPostsError('');
    try {
      const res = await api.get(`/aggregations/users/${idToFetch}/posts`);
      setUserPostsData(res.data.data);
    } catch (err) {
      setPostsError(err.response?.data?.message || 'Failed to load author profile and posts');
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchUsersByInterests();
    if (user?._id) {
      setSelectedUserId(user._id);
      fetchUserPosts(user._id);
    }
  }, [user]);

  const handleSelectMember = (userId) => {
    setSelectedUserId(userId);
    setShowCustomInput(false);
    fetchUserPosts(userId);
  };

  const handleCustomIdSubmit = (e) => {
    e.preventDefault();
    if (!customIdInput.trim()) return;
    setSelectedUserId(customIdInput.trim());
    fetchUserPosts(customIdInput.trim());
  };

  return (
    <div style={{ maxWidth: '960px', margin: '32px auto', padding: '0 20px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: '700', margin: '0 0 6px 0', color: '#111827' }}>
          Explore Community
        </h2>
        <p style={{ margin: 0, color: '#4b5563', fontSize: '15px' }}>
          Discover members across shared interest groups and browse their published stories.
        </p>
      </div>

      <section style={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '24px', border: '1px solid #e5e7eb', marginBottom: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
              Interest Hubs
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
              Select any member below to inspect their profile and authored posts.
            </p>
          </div>
          <button
            onClick={fetchUsersByInterests}
            style={{ padding: '6px 14px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
          >
            Refresh Hubs
          </button>
        </div>

        {interestsError && (
          <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '10px 14px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' }}>
            {interestsError}
          </div>
        )}

        {loadingInterests ? (
          <p style={{ color: '#6b7280' }}>Loading interest hubs...</p>
        ) : interestsData.length === 0 ? (
          <p style={{ color: '#6b7280' }}>No interest communities found yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {interestsData.map((group) => {
              const interestName = group.interest.charAt(0).toUpperCase() + group.interest.slice(1);

              return (
                <div
                  key={group.interest}
                  style={{
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontWeight: '600', fontSize: '16px', color: '#111827' }}>
                      {interestName}
                    </span>
                    <span
                      style={{
                        backgroundColor: '#e0f2fe',
                        color: '#0369a1',
                        fontSize: '12px',
                        fontWeight: '600',
                        padding: '3px 10px',
                        borderRadius: '12px',
                      }}
                    >
                      {group.totalUsers} {group.totalUsers === 1 ? 'member' : 'members'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {group.users.map((u) => {
                      const isSelected = selectedUserId === u._id;
                      return (
                        <button
                          key={u._id}
                          onClick={() => handleSelectMember(u._id)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '16px',
                            fontSize: '12px',
                            border: isSelected ? '1px solid #2563eb' : '1px solid #d1d5db',
                            backgroundColor: isSelected ? '#2563eb' : '#ffffff',
                            color: isSelected ? '#ffffff' : '#374151',
                            cursor: 'pointer',
                            fontWeight: isSelected ? '600' : '400',
                            transition: 'all 0.15s ease-in-out',
                          }}
                          title={`Click to view ${u.name}'s posts`}
                        >
                          {u.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section style={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '24px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
              Member Showcase & Publications
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
              Select any member from the dropdown or click a name from an interest hub above.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: '#374151' }}>Member:</label>
            <select
              value={selectedUserId}
              onChange={(e) => handleSelectMember(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                backgroundColor: '#ffffff',
                fontSize: '13px',
                color: '#1f2937',
              }}
            >
              {availableUsers.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowCustomInput(!showCustomInput)}
              style={{
                padding: '6px 10px',
                fontSize: '12px',
                color: '#4b5563',
                backgroundColor: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              {showCustomInput ? 'Hide ID Input' : 'Manual ID'}
            </button>
          </div>
        </div>

        {showCustomInput && (
          <form
            onSubmit={handleCustomIdSubmit}
            style={{
              display: 'flex',
              gap: '8px',
              padding: '12px',
              backgroundColor: '#f9fafb',
              borderRadius: '6px',
              border: '1px solid #e5e7eb',
              marginBottom: '20px',
            }}
          >
            <input
              type="text"
              placeholder="Enter User ID (e.g. 6af403...)"
              value={customIdInput}
              onChange={(e) => setCustomIdInput(e.target.value)}
              style={{ flex: 1, padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px' }}
            />
            <button
              type="submit"
              style={{ padding: '6px 14px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
            >
              Search ID
            </button>
          </form>
        )}

        {postsError && (
          <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '10px 14px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' }}>
            {postsError}
          </div>
        )}

        {loadingPosts ? (
          <p style={{ color: '#6b7280' }}>Loading member showcase...</p>
        ) : userPostsData ? (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '18px',
                }}
              >
                {userPostsData.name ? userPostsData.name.charAt(0).toUpperCase() : 'U'}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                    {userPostsData.name}
                  </h4>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontSize: '11px',
                      fontWeight: '600',
                      backgroundColor: userPostsData.role === 'admin' ? '#fef3c7' : '#e0f2fe',
                      color: userPostsData.role === 'admin' ? '#92400e' : '#0369a1',
                      textTransform: 'uppercase',
                    }}
                  >
                    {userPostsData.role}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>{userPostsData.email}</div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>
                  {userPostsData.postCount || (userPostsData.posts ? userPostsData.posts.length : 0)}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Published Posts</div>
              </div>
            </div>

            <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#374151', margin: '0 0 12px 0' }}>
              Publications by {userPostsData.name}
            </h4>

            {userPostsData.posts && userPostsData.posts.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {userPostsData.posts.map((post) => (
                  <div
                    key={post._id}
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '16px',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <h5 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: '600', color: '#111827' }}>
                      {post.title}
                    </h5>
                    <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#4b5563', lineHeight: '1.5' }}>
                      {post.content}
                    </p>
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                      Published on {new Date(post.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  padding: '24px',
                  textAlign: 'center',
                  backgroundColor: '#f9fafb',
                  borderRadius: '6px',
                  color: '#6b7280',
                  fontSize: '14px',
                }}
              >
                This member has not published any community posts yet.
              </div>
            )}
          </div>
        ) : null}
      </section>
    </div>
  );
};

export default Aggregations;
