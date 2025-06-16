const express = require('express');
const session = require('express-session');
const app = express();

require('dotenv').config();

const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:3001', // your React frontend URL
  credentials: true
}));


const authRoutes = require('./routes/auth');



const path = require('path');

const fs = require('fs');
const uploadPath = 'uploads';

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}


const userRoutes = require('./routes/users');
const categoriesRoutes = require('./routes/categories');
const videosRoutes = require('./routes/videos');
const PORT = process.env.PORT || 3000;

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



app.use(session({
  secret: 'yourSecretKey',           // change to a strong secret in prod
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // set to true if using HTTPS
    maxAge: 60 * 60 * 1000 // 1 hour
  }
}));

app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api', videosRoutes);
app.use('/api/auth', authRoutes);



const phrasesRoutes = require('./routes/phrases');


app.use('/api/phrases', phrasesRoutes);
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
