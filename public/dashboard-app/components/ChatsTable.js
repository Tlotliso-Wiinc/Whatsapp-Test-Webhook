// Chats Table Component
window.ChatsTable = function ChatsTable() {
    const { useState, useEffect, api, safeFormatDate } = window;
    const [chats, setChats] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [selectedChat, setSelectedChat] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadChats = async (page = 1) => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.getChats(page);
            setChats(data.chats || []);
            setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
        } catch (error) {
            console.error('Error loading chats:', error);
            setError('Failed to load chats');
            setChats([]);
            setPagination({ page: 1, totalPages: 1, total: 0 });
        } finally {
            setLoading(false);
        }
    };

    const loadChatDetails = async (chatId) => {
        try {
            const chat = await api.getChatDetails(chatId);
            setSelectedChat(chat);
        } catch (error) {
            console.error('Error loading chat details:', error);
        }
    };

    const handleDeleteChat = async (chatId, chatTitle) => {
        if (!window.confirm(`Are you sure you want to delete chat "${chatTitle}"? This will also delete all messages in this chat.`)) {
            return;
        }

        try {
            const response = await fetch(`/api/chats/${chatId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                // Reload chats list
                await loadChats(pagination.page);
                // Clear selected chat if it was deleted
                if (selectedChat && selectedChat.id === chatId) {
                    setSelectedChat(null);
                }
            } else {
                const error = await response.json();
                alert(`Failed to delete chat: ${error.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error deleting chat:', error);
            alert('Failed to delete chat. Please try again.');
        }
    };

    useEffect(() => {
        loadChats();
        lucide.createIcons();
    }, []);

    useEffect(() => {
        lucide.createIcons();
    }, [chats, selectedChat]);

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Chats</h3>
                </div>
                <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Summary</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Messages</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan="6" className="px-6 py-4 text-center">Loading...</td></tr>
                            ) : error ? (
                                <tr><td colSpan="6" className="px-6 py-4 text-center text-red-600">{error}</td></tr>
                            ) : chats.length === 0 ? (
                                <tr><td colSpan="6" className="px-6 py-4 text-center text-gray-500">No chats found</td></tr>
                            ) : chats.map(chat => (
                                <tr key={chat.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {chat.user ? chat.user.name || chat.user.phone : 'Unknown'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {chat.title}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                                        {chat.summary || 'No summary'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{chat.messageCount}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {safeFormatDate(chat.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    loadChatDetails(chat.id);
                                                }}
                                                className="text-blue-600 hover:text-blue-900 font-medium px-2 py-1 rounded border border-blue-300 hover:border-blue-500"
                                                title="View chat details"
                                            >
                                                View
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteChat(chat.id, chat.title || `Chat ${chat.id}`);
                                                }}
                                                className="text-red-600 hover:text-red-900 font-medium px-2 py-1 rounded border border-red-300 hover:border-red-500"
                                                title="Delete chat"
                                            >
                                                Delete
                                            </button>
                                        </div>
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
                                onClick={() => loadChats(pagination.page - 1)}
                                disabled={pagination.page <= 1}
                                className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                            >
                                Previous
                            </button>
                            <span className="py-2">Page {pagination.page} of {pagination.totalPages}</span>
                            <button
                                onClick={() => loadChats(pagination.page + 1)}
                                disabled={pagination.page >= pagination.totalPages}
                                className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {selectedChat && (
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">
                            {selectedChat.title || `Chat ID: ${selectedChat.id}`}
                        </h3>
                        {selectedChat.user && (
                            <p className="text-sm text-gray-600 mt-1">
                                User: {selectedChat.user.name || selectedChat.user.phone}
                            </p>
                        )}
                    </div>
                    {selectedChat.summary && (
                        <div className="px-6 py-4 border-b border-gray-200">
                            <p className="text-sm text-gray-700">
                                <strong>Summary:</strong> {selectedChat.summary}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Created: {safeFormatDate(selectedChat.createdAt, 'dateTimeString')}
                            </p>
                        </div>
                    )}
                    <div className="p-6 max-h-96 overflow-y-auto">
                        {selectedChat.messages && selectedChat.messages.length > 0 ? (
                            selectedChat.messages.map(message => (
                                <div key={message.id} className={`mb-4 ${message.type === 'human' ? 'text-right' : 'text-left'}`}>
                                    <div className={`inline-block max-w-xs px-4 py-2 rounded-lg ${
                                        message.type === 'human' 
                                            ? 'bg-blue-500 text-white' 
                                            : 'bg-gray-200 text-gray-900'
                                    }`}>
                                        <p className="text-sm">{message.content}</p>
                                        <p className="text-xs mt-1 opacity-75">
                                            {safeFormatDate(message.createdAt, 'timeString')}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-500 py-8">
                                No messages found in this chat
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
