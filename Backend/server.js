const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// Define CORS options
const corsOptions = {
  origin: `http://localhost:3000`,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
};

// Apply CORS to Express
app.use(cors(corsOptions));

// Connect to MongoDB
connectDB();

// Middlewarea
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

app.get('/', (req, res) => {
  res.send('Server is running on port 5000');
});

// Routes
// app.use('/api/claims', claimRoutes );

// Catch-all 404 handler
app.use((req, res) => {
  res.status(404).send('Not Found');
});


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});