// Messages Table Component
window.MessagesTable = function MessagesTable() {
    const { useState, useEffect, api, safeFormatDate, getDateFromObject } = window;
    const [messages, setMessages] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadMessages = async (page = 1) => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.getMessages(page);
            setMessages(data.messages || []);
            setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
        } catch (error) {
            console.error('Error loading messages:', error);
            setError('Failed to load messages');
            setMessages([]);
            setPagination({ page: 1, totalPages: 1, total: 0 });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteMessage = async (messageId, messageContent) => {
        if (!window.confirm(`Are you sure you want to delete this message?\n\n"${messageContent.substring(0, 100)}${messageContent.length > 100 ? '...' : ''}"`)) {
            return;
        }

        try {
            const response = await fetch(`/api/messages/${messageId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                // Reload messages list
                await loadMessages(pagination.page);
            } else {
                const error = await response.json();
                alert(`Failed to delete message: ${error.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error deleting message:', error);
            alert('Failed to delete message. Please try again.');
        }
    };

    useEffect(() => {
        loadMessages();
        lucide.createIcons();
    }, []);

    useEffect(() => {
        lucide.createIcons();
    }, [messages]);

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Messages</h3>
            </div>
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chat ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="6" className="px-6 py-4 text-center">Loading...</td></tr>
                        ) : error ? (
                            <tr><td colSpan="6" className="px-6 py-4 text-center text-red-600">{error}</td></tr>
                        ) : messages.length === 0 ? (
                            <tr><td colSpan="6" className="px-6 py-4 text-center text-gray-500">No messages found</td></tr>
                        ) : messages.map(message => (
                            <tr key={message.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {message.user ? message.user.name || message.user.phone : 'Unknown'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {message.chat ? message.chat.id : 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                        message.type === 'human' 
                                            ? 'bg-blue-100 text-blue-800' 
                                            : 'bg-green-100 text-green-800'
                                    }`}>
                                        {message.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                                    {message.content}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {safeFormatDate(getDateFromObject(message), 'dateTimeString')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <button
                                        onClick={() => handleDeleteMessage(message.id, message.content)}
                                        className="text-red-600 hover:text-red-900 font-medium px-2 py-1 rounded border border-red-300 hover:border-red-500"
                                        title="Delete message"
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
                            onClick={() => loadMessages(pagination.page - 1)}
                            disabled={pagination.page <= 1}
                            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                        >
                            Previous
                        </button>
                        <span className="py-2">Page {pagination.page} of {pagination.totalPages}</span>
                        <button
                            onClick={() => loadMessages(pagination.page + 1)}
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
