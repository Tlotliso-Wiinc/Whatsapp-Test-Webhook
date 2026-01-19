window.useState = React.useState;
window.useEffect = React.useEffect;

// Helper function to safely format dates
window.safeFormatDate = (date, format = 'dateString') => {
    if (!date) return 'N/A';
    
    try {
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) return 'Invalid Date';
        
        // Format: DD/MM/YYYY H:mm
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();
        const hours = String(dateObj.getHours()).padStart(2, '0');
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
        
        const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}`;
        
        switch (format) {
            case 'dateString':
                return formattedDate;
            case 'timeString':
                return `${hours}:${minutes}`;
            case 'dateTimeString':
                return formattedDate;
            default:
                return formattedDate;
        }
    } catch (error) {
        return 'Invalid Date';
    }
};

// Helper function to get date from object (handles both camelCase and underscore)
window.getDateFromObject = (obj) => {
    if (!obj) return null;
    return obj.createdAt || obj.created_at || obj.updatedAt || obj.updated_at || null;
};
