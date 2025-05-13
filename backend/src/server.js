require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bcrypt = require('bcrypt');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const subscriptionRoutes = require('./routes/subscription.routes');
const serverRoutes = require('./routes/server.routes');

// Import database connection
const db = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/servers', serverRoutes);

app.get('/', (req, res) => {
  res.json(`Welcome to ${process.env.APP_NAME}`);
});

app.get('/users', async (req, res) => {
  try {
    const users = await db.User.findAll();
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

const initializeDatabase = async () => {
  try {
    // Test the connection
    await db.sequelize.authenticate();
    console.log('Database connection established successfully.');

    if (process.env.DB_SYNC === 'true') {
      console.log('Syncing database models...');
      await db.sequelize.sync({ force: false });

      // Check if admin user already exists
      const adminExists = await db.User.findOne({
        where: {
          email: 'admin@admin.com'
        }
      });

      if (!adminExists) {
        const hashedPassword = await bcrypt.hash('password', 10);
        const user = {
          username: 'admin',
          email: 'admin@admin.com',
          password: hashedPassword, // Note: You should hash this password!
          first_name: 'Admin',
          last_name: 'CEO',
          role: 'admin'
        };

        await db.User.create(user);
        console.log('Admin user created successfully');
      } else {
        console.log('Admin user already exists - skipping creation');
      }

      console.log('Database synchronized successfully');
    } else {
      console.log('Database sync skipped - using existing database');
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Database initialization failed:', err);
    process.exit(1);
  }
};

initializeDatabase();