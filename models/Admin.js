// models/Admin.js
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db.js';

class Admin extends Model {}

Admin.init(
  {
    /* ───────── primary key ───────── */
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    /* ───────── core profile ───────── */
    adminName: {
      type: DataTypes.STRING(60),
      allowNull: false,
      validate: { len: [2, 60] },
    },

    email: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },

    password: {
      type: DataTypes.STRING, // hashed
      allowNull: false,
    },

    /* ───────── role (fixed) ───────── */
    role: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'admin',
      validate: { isIn: [['admin']] },
    },

    /* ───────── manual-approval fields (NEW) ───────── */
    isApproved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    approvalToken: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    /* ───────── password-reset ───────── */
    resetOTP: {
      type: DataTypes.STRING(6),
      allowNull: true,
    },
    resetOTPExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Admin',
    tableName: 'admins',   // keep in sync with migration / SQL
    timestamps: true,
    underscored: true,     // converts isApproved → is_approved, etc.
  },
);

export default Admin;
