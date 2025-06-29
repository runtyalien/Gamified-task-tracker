const express = require('express');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/test', (req, res) => {
  res.json({ message: 'Basic server works' });
});

app.listen(PORT, () => {
  console.log(`Minimal server running on port ${PORT}`);
});
