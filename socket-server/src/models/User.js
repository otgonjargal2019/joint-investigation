import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";

class User extends Model {}

User.init(
  {
    userId: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      field: "user_id",
    },
    loginId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: "login_id",
    },
    nameKr: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "name_kr",
    },
    nameEn: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "name_en",
    },
    profileImageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "profile_image_url",
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: false,
    underscored: true,
  }
);

export default User;
