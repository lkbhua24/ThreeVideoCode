const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Hello'));
app.listen(3301, () => console.log('Test server running on 3301'));
