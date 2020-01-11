const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

const Todo = require('./models/todoModel');

const app = express();
const PORT = process.env.PORT || 3005;

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
    let body = {text: req.body.text, completed: req.body.completed};

    if (body.completed === true || body.completed === false && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completed = null;
    }

    Todo.findByIdAndUpdate(id, {$set: body}, {new: true})
        .then(todo => {
            if (!todo) {
                return res.status(404).send();
            }

            return res.status(200).send({todo});
        })
        .catch();
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
