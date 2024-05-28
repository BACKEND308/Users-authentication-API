const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectMongo = require('./db/connectMongo');

const userRoutes = require('./routes/user.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

//MongoDB connection
connectMongo();

//connect to routes
app.use('/api/user', userRoutes);

//Define a simple route for testing, ping with 1
app.get('/', (req, res) => {
    res.send('Hello World! This is the user information API.');
});

//Set the port and start the server
const port=process.env.PORT || 5006;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
