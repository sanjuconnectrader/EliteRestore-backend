// backend/models/Blog.js
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db.js';
import Admin from './Admin.js';

class Blog extends Model {}

Blog.init(
  {
    id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title:     { type: DataTypes.STRING(150), allowNull: false },
    contents:  { type: DataTypes.TEXT,        allowNull: false },
    date:      { type: DataTypes.DATEONLY,    allowNull: false },
    readTime:  { type: DataTypes.STRING(20) },
    category:  { type: DataTypes.STRING(60) },
    img:       { type: DataTypes.BLOB('long') },
    imgName:   { type: DataTypes.STRING },
    imgType:   { type: DataTypes.STRING },
    adminId:   { type: DataTypes.INTEGER, allowNull: false },   // FK → admins.id
  },
  {
    sequelize,
    modelName : 'Blog',
    tableName : 'blogs',
    timestamps: true,
    underscored: true,
  }
);

/* ---------- associations ---------- */
Blog.belongsTo(Admin, { foreignKey: 'adminId', as: 'author' });

export default Blog;
