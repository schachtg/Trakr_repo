const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const cors = require('cors');
const ticketRoutes = require('./routes/ticketsRoutes');
const userInfoRoutes = require('./routes/userInfoRoutes');
const projectsRoutes = require('./routes/projectsRoutes');
const epicsRoutes = require('./routes/epicsRoutes');
const colsRoutes = require('./routes/colsRoutes');
const rolesRoutes = require('./routes/rolesRoutes');
require('dotenv');

const allowedOrigins = ['http://localhost:3000', 'http://localhost:5000', '/api/v1/'];
const corsOptions = {
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use('/api/v1/tickets', ticketRoutes);
app.use('/api/v1/user_info', userInfoRoutes);
app.use('/api/v1/projects', projectsRoutes);
app.use('/api/v1/epics', epicsRoutes);
app.use('/api/v1/cols', colsRoutes);
app.use('/api/v1/roles', rolesRoutes);

app.listen(process.env.DB_PORT, () => {
  console.log('Server has started on port ' + process.env.DB_PORT);
});