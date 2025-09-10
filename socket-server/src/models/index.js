import User from "./User.js";
import Message from "./Message.js";
import Notification from "./Notification.js";

// One user can send many messages
User.hasMany(Message, { foreignKey: "sender_id", as: "sentMessages" });

// One user can receive many messages
User.hasMany(Message, { foreignKey: "recipient_id", as: "receivedMessages" });

// Each message belongs to a sender
Message.belongsTo(User, { foreignKey: "sender_id", as: "sender" });

// Each message belongs to a recipient
Message.belongsTo(User, { foreignKey: "recipient_id", as: "recipient" });

// One user can have many notifications
User.hasMany(Notification, { foreignKey: "user_id", as: "notifications" });

// Each notification belongs to a user
Notification.belongsTo(User, { foreignKey: "user_id", as: "user" });

export { User, Message, Notification };
