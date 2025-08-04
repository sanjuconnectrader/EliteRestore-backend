import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

/* ───── pull env vars once ───── */
const {
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_PORT = 3306,      // default to 3306 if not set
} = process.env;

/* ───── initialise Sequelize ───── */
const sequelize = new Sequelize(
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  {
    host    : DB_HOST,
    port    : DB_PORT,  //  ← now using DB_PORT
    dialect : 'mysql',
    logging : false,    // flip to console.log to debug SQL
  },
);

export default sequelize;
