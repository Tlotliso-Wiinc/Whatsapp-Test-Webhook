// Knowledge Base Component
window.KnowledgeBase = function KnowledgeBase() {
    const { useState, useEffect, api, safeFormatDate, getDateFromObject } = window;
    const [items, setItems] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [filter, setFilter] = useState('');
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        type: 'text',
        content: '',
        url: '',
        tags: []
    });

    const loadKnowledge = async (page = 1) => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.getKnowledge(page, 10, filter);
            setItems(data.items || []);
            setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
        } catch (error) {
            console.error('Error loading knowledge base:', error);
            setError('Failed to load knowledge base');
            setItems([]);
            setPagination({ page: 1, totalPages: 1, total: 0 });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await api.updateKnowledge(editingItem.id, formData);
            } else {
                await api.createKnowledge(formData);
            }
            setFormData({ title: '', type: 'text', content: '', url: '', tags: [] });
            setShowForm(false);
            setEditingItem(null);
            loadKnowledge();
        } catch (error) {
            console.error('Error saving knowledge item:', error);
        }
    };

    const handleEdit = (item) => {
        setFormData({
            title: item.title,
            type: item.type,
            content: item.content || '',
            url: item.url || '',
            tags: item.tags || []
        });
        setEditingItem(item);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this item?')) {
            try {
                await api.deleteKnowledge(id);
                loadKnowledge();
            } catch (error) {
                console.error('Error deleting knowledge item:', error);
            }
        }
    };

    useEffect(() => {
        loadKnowledge();
        lucide.createIcons();
    }, [filter]);

    useEffect(() => {
        lucide.createIcons();
    }, [items]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Knowledge Base</h3>
                <div className="flex space-x-2">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md"
                    >
                        <option value="">All Types</option>
                        <option value="text">Text</option>
                        <option value="document">Document</option>
                        <option value="api">API</option>
                        <option value="website">Website</option>
                    </select>
                    <button
                        onClick={() => setShowForm(true)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                        Add Item
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h4 className="text-md font-medium mb-4">
                        {editingItem ? 'Edit Knowledge Item' : 'Add Knowledge Item'}
                    </h4>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Title</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({...formData, type: e.target.value})}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                                <option value="text">Text</option>
                                <option value="document">Document</option>
                                <option value="api">API</option>
                                <option value="website">Website</option>
                            </select>
                        </div>
                        {(formData.type === 'text' || formData.type === 'document') && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Content</label>
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                                    rows={4}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                        )}
                        {(formData.type === 'api' || formData.type === 'website') && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">URL</label>
                                <input
                                    type="url"
                                    value={formData.url}
                                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                        )}
                        <div className="flex justify-end space-x-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingItem(null);
                                    setFormData({ title: '', type: 'text', content: '', url: '', tags: [] });
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-md"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-500 text-white rounded-md"
                            >
                                {editingItem ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-lg shadow">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan="5" className="px-6 py-4 text-center">Loading...</td></tr>
                            ) : error ? (
                                <tr><td colSpan="5" className="px-6 py-4 text-center text-red-600">{error}</td></tr>
                            ) : items.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-4 text-center text-gray-500">No knowledge items found</td></tr>
                            ) : items.map(item => (
                                <tr key={item.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                            {item.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            item.is_active 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {item.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {safeFormatDate(getDateFromObject(item))}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="text-blue-600 hover:text-blue-900 mr-3"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
