// Main Dashboard Component
window.Dashboard = function Dashboard() {
    const { useState, useEffect, api, StatsCard, UsersTable, ChatsTable, MessagesTable, KnowledgeBase } = window;
    const [stats, setStats] = useState({});
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadStats = async () => {
        try {
            const data = await api.getStats();
            setStats(data);
            setError(null);
        } catch (error) {
            console.error('Error loading stats:', error);
            setError('Failed to load dashboard statistics');
            setStats({});
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStats();
        lucide.createIcons();
    }, []);

    useEffect(() => {
        lucide.createIcons();
    }, [activeTab]);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                        <div className="text-sm text-gray-500">
                            {new Date().toLocaleString()}
                        </div>
                    </div>
                </div>
            </header>

            {/* Navigation */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-8">
                        {['overview', 'users', 'chats', 'messages', 'knowledge'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                                    activeTab === tab
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-md p-4">
                                <div className="text-red-800">{error}</div>
                                <button 
                                    onClick={loadStats}
                                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                    Retry
                                </button>
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatsCard title="Total Users" value={loading ? '...' : (stats.totalUsers || 0)} icon="users" color="blue" />
                            <StatsCard title="Total Chats" value={loading ? '...' : (stats.totalChats || 0)} icon="message-circle" color="green" />
                            <StatsCard title="Total Messages" value={loading ? '...' : (stats.totalMessages || 0)} icon="message-square" color="yellow" />
                            <StatsCard title="Knowledge Items" value={loading ? '...' : (stats.totalKnowledgeItems || 0)} icon="book" color="purple" />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/*
                            <StatsCard title="Recent Users (7d)" value={loading ? '...' : (stats.recentUsers || 0)} icon="user-plus" color="green" />
                            <StatsCard title="Recent Messages (7d)" value={loading ? '...' : (stats.recentMessages || 0)} icon="trending-up" color="blue" />
                        */}
                            <StatsCard title="Active Knowledge Items" value={loading ? '...' : (stats.activeKnowledgeItems || 0)} icon="check-circle" color="green" />
                            <StatsCard title="Inactive Knowledge Items" value={loading ? '...' : ((stats.totalKnowledgeItems || 0) - (stats.activeKnowledgeItems || 0))} icon="x-circle" color="red" />
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && <UsersTable />}

                {/* Chats Tab */}
                {activeTab === 'chats' && <ChatsTable />}

                {/* Messages Tab */}
                {activeTab === 'messages' && <MessagesTable />}

                {/* Knowledge Base Tab */}
                {activeTab === 'knowledge' && <KnowledgeBase />}
            </main>
        </div>
    );
};
