require("../config/config");
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const User = require('./models/userModel');
const _ = require('lodash');

const Todo = require('./models/todoModel');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    let todo = new Todo({
        text: req.body.text,
    });
    todo.save()
        .then(doc => res.send(doc))
        .catch(err => res.status(400).send(err));
});

app.get('/todos', (req, res) => {
    Todo.find()
        .then(todos => res.send({todos}))
        .catch(e => res.status(400).send(e));
});

app.get('/todos/:id', (req, res) => {
    let id = checkAndReturnId(req, res);

    Todo.findById(id)
        .then(todo => {
            if (!todo) {
                return res.status(404).send();
            }

            res.send({todo})
        })
        .catch(err => res.status(400).send());
});

app.delete('/todos/:id', (req, res) => {
    let id = checkAndReturnId(req, res);

    Todo.findByIdAndRemove(id)
        .then(todo => {
            if (!todo) {
                return res.status(404).send();
            }
            return res.send({todo});
        })
        .catch(e => {
            console.log("error");
            return res.status(400).send();
        });
});

app.patch('/todos/:id', (req, res) => {
    let id = checkAndReturnId(req, res);
    let body = _.pick(req.body, ['text', 'completed']);

    if (body.completed === true || body.completed === false && body.completed) {
        body.completed_at = new Date().getTime();
    } else {
        body.completed = false;
        body.completed_at = null;
    }

    Todo.findByIdAndUpdate(id, {$set: body}, {new: true})
        .then(todo => {
            if (!todo) {
                return res.status(404).send();
            }

            return res.status(201).send({todo});
        })
        .catch();
});

app.post('/users', (req, res) => {
    const body = _.pick(req.body, ['email', 'password']);
    const user = new User(body);

    user
        .save()
        .then(user => {
            return user.generateAuthToken();
        })
        .then(token => {
            res.header('x-auth', token).send(user);
        })
        .catch(e => {
            res.status(400).send(e);
        });
});

checkAndReturnId = (req, res) => {
    let id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(400).send();
    }

    return id;
};

app.listen(PORT, () => {
    console.log(`server is running on localhost:${PORT}`);
});

module.exports = app;
