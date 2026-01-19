// Stats Card Component
window.StatsCard = function StatsCard({ title, value, icon, color = "blue" }) {
    const colorClasses = {
        blue: "bg-blue-500",
        green: "bg-green-500",
        yellow: "bg-yellow-500",
        purple: "bg-purple-500",
        red: "bg-red-500"
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
                <div className={`${colorClasses[color]} p-3 rounded-full mr-4`}>
                    <i data-lucide={icon} className="w-6 h-6 text-white"></i>
                </div>
                <div>
                    <p className="text-sm text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
            </div>
        </div>
    );
};
