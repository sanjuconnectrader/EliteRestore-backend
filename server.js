import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; 
import sequelize from './config/db.js';
import approvalRoutes from './routes/approvalRoutes.js';
import authRoutes from './routes/authRoutes.js';
import passwordRoutes from './routes/passwordRoutes.js';
import blogRoutes from './routes/blogRoutes.js'; 

dotenv.config();
const app = express();

/* core middleware */
app.use(cors()); 
app.use(express.json());




app.use('/api/auth', authRoutes);
app.use('/api/auth', passwordRoutes);
app.use('/api/admin/approval', approvalRoutes);
app.use('/api/blogs', blogRoutes);  


const PORT = process.env.PORT || 5000;

/* ---- bootstrap ---- */
(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();     // swap for migrations in prod
    console.log('DB connected ✅');

    app.listen(PORT, () =>
      console.log(`API ready ➜  http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error('Unable to connect to DB ❌', err);
    process.exit(1);
  }
})();