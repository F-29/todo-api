const express = require('express');
const bodyParser = require('body-parser');

const mongoose = require('../mongoose-config');
const Todo = require('./models/todoModel');
// const User = require('./models/userModel');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    let todo = new Todo({
        text: req.body.text,
    });
    todo.save()
        .then(doc => res.send(doc))
        .catch(err => res.status(400).send(err));
});

app.listen(PORT, () => {
    console.log(`server is running on localhost:${PORT}`);
});
