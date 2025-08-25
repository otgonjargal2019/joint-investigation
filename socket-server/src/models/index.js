import User from "./User.js";
import Message from "./Message.js";

// Associations
Message.belongsTo(User, { foreignKey: "senderId", as: "sender" });
Message.belongsTo(User, { foreignKey: "receiverId", as: "receiver" });

export { User, Message };
