import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";

class Message extends Model {}

Message.init(
  {
    messageId: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      field: "message_id",
    },
    senderId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "sender_id",
    },
    recipientId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "recipient_id",
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "is_read",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "created_at",
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "Message",
    tableName: "messages",
    timestamps: false,
    underscored: true,
  }
);

export default Message;
