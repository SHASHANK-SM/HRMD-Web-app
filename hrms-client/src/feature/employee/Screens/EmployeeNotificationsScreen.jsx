import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CheckCircle2,
  CalendarDays,
  Receipt,
  Clock3,
  UserPlus,
  Check,
  Trash2,
} from "lucide-react";
import { useSelector } from "react-redux";
import { API } from "../../../Core/url";

const EmployeeNotificationsScreen = () => {
  const { token } = useSelector((state) => state.auth);

  const [notifications, setNotifications] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("All");

  const authConfig = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
    [token],
  );

  const formatDate = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const normalizeNotification = (notification) => {
    const createdAt =
      notification.createdAt ||
      notification.date ||
      notification.timestamp ||
      notification.updatedAt;

    return {
      ...notification,
      id: notification._id || notification.id,
      title: notification.title || notification.subject || "Notification",
      message:
        notification.message ||
        notification.body ||
        notification.description ||
        "",
      type: notification.type || "attendance",
      date: notification.date || formatDate(createdAt),
      time: notification.time || formatTime(createdAt),
      read:
        notification.read ?? notification.isRead ?? notification.readAt != null,
    };
  };

  const fetchNotifications = async () => {
    try {
      const response = await API.get("/notifications", authConfig);

      const payload = response?.data;

      const notificationData = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.data?.notifications)
          ? payload.data.notifications
          : Array.isArray(payload?.notifications)
            ? payload.notifications
            : Array.isArray(payload)
              ? payload
              : [];

      setNotifications(notificationData.map(normalizeNotification));
    } catch (error) {
      console.error(
        "Failed to fetch notifications:",
        error?.response?.data || error.message,
      );
    }
  };

  useEffect(() => {
    if (token) {
      fetchNotifications();
    }
  }, [token]);

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  const filteredNotifications = useMemo(() => {
    if (selectedFilter === "Unread") {
      return notifications.filter((notification) => !notification.read);
    }

    if (selectedFilter === "Read") {
      return notifications.filter((notification) => notification.read);
    }

    return notifications;
  }, [notifications, selectedFilter]);

  const markAsRead = async (id) => {
    if (!id) return;

    try {
      await API.patch(`/notifications/${id}/read`, {}, authConfig);

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? { ...notification, read: true }
            : notification,
        ),
      );
    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error?.response?.data || error.message,
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      await API.patch("/notifications/read-all", {}, authConfig);

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          read: true,
        })),
      );
    } catch (error) {
      console.error(
        "Failed to mark all notifications as read:",
        error?.response?.data || error.message,
      );
    }
  };

  const deleteNotification = (id) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id),
    );
  };

  const clearReadNotifications = () => {
    setNotifications((prev) =>
      prev.filter((notification) => !notification.read),
    );
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Page Header */}
      <section>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">Notifications</p>

            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Notifications
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Stay updated with your HR activities and important announcements.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <Check size={16} />
              Mark all as read
            </button>
          )}
        </div>
      </section>

      {/* Summary */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          title="Total Notifications"
          value={notifications.length}
          subtitle="All notifications"
          icon={Bell}
        />

        <SummaryCard
          title="Unread"
          value={unreadCount}
          subtitle="Need your attention"
          icon={Clock3}
        />

        <SummaryCard
          title="Read"
          value={notifications.length - unreadCount}
          subtitle="Already viewed"
          icon={CheckCircle2}
        />
      </section>

      {/* Filters */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
            {["All", "Unread", "Read"].map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setSelectedFilter(filter)}
                className={`rounded-lg px-4 py-2 text-xs font-medium transition ${
                  selectedFilter === filter
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {filter}

                {filter === "Unread" && unreadCount > 0 && (
                  <span className="ml-1.5 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] text-blue-600">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={clearReadNotifications}
            disabled={notifications.length - unreadCount === 0}
            className="flex items-center justify-center gap-2 text-xs font-medium text-slate-500 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 size={14} />
            Clear read notifications
          </button>
        </div>
      </section>

      {/* Notification List */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
          <h3 className="text-base font-semibold text-slate-900">
            Recent Notifications
          </h3>

          <p className="mt-0.5 text-xs text-slate-500">
            Your latest HRMS updates and activities.
          </p>
        </div>

        {filteredNotifications.length > 0 ? (
          <div>
            {filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={() => markAsRead(notification.id)}
                onDelete={() => deleteNotification(notification.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState filter={selectedFilter} />
        )}
      </section>
    </div>
  );
};

// eslint-disable-next-line no-unused-vars
const SummaryCard = ({ title, value, subtitle, icon: Icon }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">{title}</p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
};

const NotificationItem = ({ notification, onRead, onDelete }) => {
  const notificationConfig = {
    leave: {
      icon: CalendarDays,
      bg: "bg-emerald-50",
      text: "text-emerald-600",
    },
    payslip: {
      icon: Receipt,
      bg: "bg-blue-50",
      text: "text-blue-600",
    },
    attendance: {
      icon: Clock3,
      bg: "bg-amber-50",
      text: "text-amber-600",
    },
    welcome: {
      icon: UserPlus,
      bg: "bg-violet-50",
      text: "text-violet-600",
    },
  };

  const config =
    notificationConfig[notification.type] || notificationConfig.attendance;

  const Icon = config.icon;

  return (
    <div
      className={`group relative flex gap-4 border-b border-slate-100 px-5 py-5 transition last:border-0 sm:px-6 ${
        notification.read ? "bg-white" : "bg-blue-50/30"
      }`}
    >
      {/* Unread indicator */}
      {!notification.read && (
        <span className="absolute left-0 top-0 h-full w-1 bg-blue-600" />
      )}

      {/* Icon */}
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${config.bg} ${config.text}`}
      >
        <Icon size={19} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h4
                className={`text-sm ${
                  notification.read
                    ? "font-medium text-slate-800"
                    : "font-semibold text-slate-900"
                }`}
              >
                {notification.title}
              </h4>

              {!notification.read && (
                <span className="h-2 w-2 rounded-full bg-blue-600" />
              )}
            </div>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
              {notification.message}
            </p>
          </div>

          <div className="shrink-0">
            <p className="text-xs text-slate-400">{notification.date}</p>

            <p className="mt-0.5 text-xs text-slate-400 sm:text-right">
              {notification.time}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-3 flex items-center gap-4">
          {!notification.read && (
            <button
              type="button"
              onClick={onRead}
              className="text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              Mark as read
            </button>
          )}

          <button
            type="button"
            onClick={onDelete}
            className="flex items-center gap-1 text-xs font-medium text-slate-400 transition hover:text-red-600"
          >
            <Trash2 size={13} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ filter }) => {
  const message =
    filter === "Unread"
      ? "You have no unread notifications."
      : filter === "Read"
        ? "You have no read notifications."
        : "You don't have any notifications yet.";

  return (
    <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <Bell size={24} />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-slate-800">
        No notifications
      </h3>

      <p className="mt-1 max-w-sm text-xs text-slate-500">{message}</p>
    </div>
  );
};

export default EmployeeNotificationsScreen;
