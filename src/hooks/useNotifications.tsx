import { createContext, useContext, useState, ReactNode } from "react";

export interface Notification {
  id: number;
  type: "request_sent" | "request_accepted" | "request_rejected" | "info";
  message: string;
  time: string;
  read: boolean;
}

const initialNotifications: Notification[] = [
  { id: 1, type: "request_accepted", message: "Faculty accepted your project request — Dr. Ramesh Kumar for ML in Healthcare.", time: "30m ago", read: false },
  { id: 2, type: "request_sent", message: "Your request was sent to Dr. Meena Sharma for NLP Chatbot.", time: "2h ago", read: false },
  { id: 3, type: "request_rejected", message: "Faculty rejected your project request — Dr. Anil Verma declined IoT Smart Campus (no available slots).", time: "5h ago", read: false },
  { id: 4, type: "info", message: "Coordinator updated project status for AR Learning Platform.", time: "8h ago", read: false },
  { id: 5, type: "request_accepted", message: "Dr. Priya Singh accepted your collaboration request for Blockchain Auth.", time: "1d ago", read: true },
  { id: 6, type: "info", message: "Admin announcement: System maintenance scheduled for March 15.", time: "1d ago", read: true },
  { id: 7, type: "request_sent", message: "Your request was sent to Dr. Kavita Joshi for AR Learning.", time: "2d ago", read: true },
  { id: 8, type: "request_rejected", message: "Dr. Sanjay Patel declined your co-author request.", time: "3d ago", read: true },
  { id: 9, type: "info", message: "Your project proposal for Data Viz Dashboard was approved.", time: "4d ago", read: true },
  { id: 10, type: "info", message: "Admin announcement: New faculty members added to the platform.", time: "5d ago", read: true },
];

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  markAsRead: () => {},
  markAllAsRead: () => {},
});

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState(initialNotifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
