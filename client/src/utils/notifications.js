/**
 * Browser Notifications Utility
 * Handles push notifications and alerts
 */

export const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
        console.log("This browser does not support desktop notifications");
        return false;
    }

    if (Notification.permission === "granted") {
        return true;
    }

    if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        return permission === "granted";
    }

    return false;
};

export const sendNotification = (title, options = {}) => {
    if (!("Notification" in window)) {
        return;
    }

    if (Notification.permission === "granted") {
        try {
            const notification = new Notification(title, {
                icon: '/vite.svg',
                badge: '/vite.svg',
                ...options,
            });

            // Auto-close after 7 seconds
            setTimeout(() => notification.close(), 7000);

            return notification;
        } catch (error) {
            console.error('Error sending notification:', error);
        }
    }
};

export const createNotificationOptions = (notification) => {
    const icons = {
        error: '🚨',
        warning: '⏰',
        success: '✅',
        info: 'ℹ️',
    };

    return {
        body: notification.message,
        tag: notification.id,
        badge: icons[notification.type] || 'ℹ️',
        timestamp: new Date(notification.timestamp).getTime(),
        data: {
            type: notification.type,
            course: notification.course,
            assignment: notification.assignment,
            dueDate: notification.due_date,
        },
    };
};

export const showNotificationToast = (message, type = 'info') => {
    // This can be used with a toast library like react-hot-toast
    console.log(`[${type.toUpperCase()}] ${message}`);
    return sendNotification(message, {
        body: type,
    });
};
