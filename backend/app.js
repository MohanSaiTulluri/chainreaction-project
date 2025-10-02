// Node.js backend skeleton
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Backend skeleton running'));

app.listen(3000, () => console.log('Backend running on port 3000'));
