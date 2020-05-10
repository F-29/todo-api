const helper = require("../helper");

const Todo = require('../models/todoModel');

const create = (req, res) => {
    let todo = new Todo({
        text: req.body.text,
    });
    todo.save()
        .then(doc => res.send(doc))
        .catch(err => res.status(400).send(err));
};

const getTodos = (req, res) => {
    Todo.find()
        .then(todos => res.send({todos}))
        .catch(e => res.status(400).send(e));
};

const getTodoById = (req, res) => {
    let id = helper.checkAndReturnId(req, res);

    Todo.findById(id)
        .then(todo => {
            if (!todo) {
                return res.status(404).send();
            }

            res.send({todo})
        })
        .catch(err => res.status(400).send());
};

const deleteById = (req, res) => {
    let id = helper.checkAndReturnId(req, res);

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
};

const update = (req, res) => {
    let id = helper.checkAndReturnId(req, res);
    let body = {text: req.body.text, completed: req.body.completed};

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
};

module.exports = {
    create,
    getTodos,
    getTodoById,
    deleteById,
    update,
};
