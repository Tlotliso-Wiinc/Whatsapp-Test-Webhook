// Users Table Component
window.UsersTable = function UsersTable() {
    const { useState, useEffect, api, safeFormatDate } = window;
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddUserForm, setShowAddUserForm] = useState(false);
    const [creatingUser, setCreatingUser] = useState(false);
    const [createError, setCreateError] = useState(null);
    const [newUserData, setNewUserData] = useState({
        phone: '',
        name: '',
        email: ''
    });

    const loadUsers = async (page = 1) => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.getUsers(page);
            setUsers(data.users || []);
            setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
        } catch (error) {
            console.error('Error loading users:', error);
            setError('Failed to load users');
            setUsers([]);
            setPagination({ page: 1, totalPages: 1, total: 0 });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setCreatingUser(true);
        setCreateError(null);

        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    phone: (newUserData.phone || '').trim(),
                    name: (newUserData.name || '').trim() || undefined,
                    email: (newUserData.email || '').trim() || undefined
                })
            });

            const payload = await response.json().catch(() => ({}));

            if (!response.ok) {
                setCreateError(payload.error || 'Failed to create user');
                return;
            }

            setNewUserData({ phone: '', name: '', email: '' });
            setShowAddUserForm(false);
            await loadUsers(pagination.page);
        } catch (error) {
            console.error('Error creating user:', error);
            setCreateError('Failed to create user');
        } finally {
            setCreatingUser(false);
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        if (!window.confirm(`Are you sure you want to delete user "${userName}"? This will also delete all their chats and messages.`)) {
            return;
        }

        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                // Reload users list
                await loadUsers(pagination.page);
            } else {
                const error = await response.json();
                alert(`Failed to delete user: ${error.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Failed to delete user. Please try again.');
        }
    };

    useEffect(() => {
        loadUsers();
        lucide.createIcons();
    }, []);

    useEffect(() => {
        lucide.createIcons();
    }, [users]);

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Users</h3>
                <button
                    onClick={() => {
                        setShowAddUserForm(true);
                        setCreateError(null);
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                    Add User
                </button>
            </div>

            {showAddUserForm && (
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                            <input
                                type="text"
                                required
                                value={newUserData.phone}
                                onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="e.g. 27831234567"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                type="text"
                                value={newUserData.name}
                                onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="Optional"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                value={newUserData.email}
                                onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="Optional"
                            />
                        </div>

                        <div className="md:col-span-3 flex items-center justify-between">
                            <div className="text-sm">
                                {createError && <span className="text-red-600">{createError}</span>}
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddUserForm(false);
                                        setCreateError(null);
                                        setNewUserData({ phone: '', name: '', email: '' });
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creatingUser}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300"
                                >
                                    {creatingUser ? 'Creating...' : 'Create User'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chats</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Messages</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="7" className="px-6 py-4 text-center">Loading...</td></tr>
                        ) : error ? (
                            <tr><td colSpan="7" className="px-6 py-4 text-center text-red-600">{error}</td></tr>
                        ) : users.length === 0 ? (
                            <tr><td colSpan="7" className="px-6 py-4 text-center text-gray-500">No users found</td></tr>
                        ) : users.map(user => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.phone}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.totalChats}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.totalMessages}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {safeFormatDate(user.createdAt)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteUser(user.id, user.name || user.phone);
                                        }}
                                        className="text-red-600 hover:text-red-900 font-medium px-2 py-1 rounded border border-red-300 hover:border-red-500"
                                        title="Delete user"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                    <div className="flex justify-between">
                        <button
                            onClick={() => loadUsers(pagination.page - 1)}
                            disabled={pagination.page <= 1}
                            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                        >
                            Previous
                        </button>
                        <span className="py-2">Page {pagination.page} of {pagination.totalPages}</span>
                        <button
                            onClick={() => loadUsers(pagination.page + 1)}
                            disabled={pagination.page >= pagination.totalPages}
                            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
