const expect = require('expect');
const {ObjectID} = require('mongodb');
const request = require('supertest');
const randomString = require('randomstring');

const app = require('./../server/server');
const Todo = require('./../server/models/todoModel');

let text = "Test Todo API";
let oldLength = 0;

beforeEach(done => {
    Todo.find()
        .then(todos => {
            oldLength = todos.length;
            done();
        })
        .catch(err => done(err));
});

afterEach(done => {
    Todo.remove({text})
        .then(() => {
            done();
        })
        .catch(error => done(error));
});

describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        request(app)
            .post('/todos')
            .send({text})
            .expect(200)
            .expect(res => {
                expect(res.body.text).toBe(text);
            })
            .end((err) => {
                if (err) {
                    return done(err)
                }

                Todo.find()
                    .then(todos => {
                        let lastTodo = todos[todos.length - 1].text;
                        expect(lastTodo).toBe(text);
                        Todo.remove({text: lastTodo.text});
                        done();
                    })
                    .catch(e => done(e));
            })
    });
    it('should NOT create todo with invalid body data', done => {
        request(app)
            .post('/todos')
            .send({})
            .expect(400)
            .end(err => {
                if (err) {
                    return done(err);
                }
                Todo.find()
                    .then(todos => {
                        expect(todos.length).toBe(oldLength);
                        done();
                    })
                    .catch(e => done(e));
            });
    });
});

describe('GET /todos', () => {
    it('should fetch all todos', (done) => {
        helperSeeder();
        request(app)
            .get('/todos')
            .expect(200)
            .expect(() => {
                Todo.find()
                    .then(todos => {
                        expect(todos.length).toBe(oldLength + 3);
                    })
                    .catch(err => done(err));
            })
            .end(done);
    });
});

describe('GET /todos/:id', () => {
    it('should return a specific todo doc', (done) => {
        helperSeeder();
        request(app)
            .get(`/todos/${todos[0]._id}`)
            .expect(200)
            .expect(res => {
                expect(res.body.todo.text).toBe(todos[0].text);
            })
            .end(done);
    });
    it('should return 404 if todo not found', (done) => {
        helperSeeder();
        request(app)
            .get(`/todos/${new ObjectID()}`)
            .expect(404)
            .end(done);
    });
    it('should return 404 for non-object ids', (done) => {
        request(app)
            .get(`/todos/${randomString.generate(24)}`)
            .expect(400)
            .end(done);
    });
});

describe('DELETE /todos/:id', () => {
    it('should remove a todo', (done) => {
        helperSeeder();
        let id = todos[1]._id;
        let text = todos[1].text;

        request(app)
            .delete(`/todos/${id}`)
            .expect(200)
            .expect(res => {
                expect(res.body.todo.text).toBe(text);
            })
            .expect(res => {
                expect(res.body.todo._id.toString()).toBe(id.toString());
            })
            .end((err) => {
                if (err) {
                    return done(err);
                }
                Todo.findById(id)
                    .then(todo => {
                        expect(todo).toBeFalsy();
                        done();
                    })
                    .catch(err => done(err));
            });
    });
    it('should return 404 if todo not found', (done) => {
        helperSeeder();
        request(app)
            .get(`/todos/${new ObjectID()}`)
            .expect(404)
            .end(done);
    });
    it('should return 400 for non-object ids', (done) => {
        request(app)
            .delete(`/todos/${randomString.generate(24)}`)
            .expect(400)
            .end(done);
    });
});

describe('PATCH /todos/:id', () => {
    it('should update text', (done) => {
        helperSeeder();
        let id = todos[2]._id;
        request(app)
            .patch(`/todos/${id}`)
            .send({text: "Something updated", completed: false})
            .expect(201)
            .expect(res => {
                expect(res.body.todo.text).toBe("Something updated");
                expect(res.body.todo.completed).toBe(false);
                expect(res.body.todo.completed_at).toBe(null);
            })
            .end(done);
    });
    it('should update completed and completed_at', (done) => {
        helperSeeder();
        let id = todos[1]._id;
        request(app)
            .patch(`/todos/${id}`)
            .send({completed: true})
            .expect(201)
            .expect(res => {
                expect(res.body.todo.completed).toBe(true);
                expect(res.body.todo.completed_at).toContain(new Date().getDate());
                expect(res.body.todo.completed_at).toContain(new Date().getFullYear());
            })
            .end(done)
    });
    it('should update text and NOT completed', (done) => {
        helperSeeder();
        let id = todos[0]._id;
        let text = "this should be the new text";

        request(app)
            .patch(`/todos/${id}`)
            .send({completed: false, text})
            .expect(201)
            .expect(res => {
                expect(res.body.todo.text.toString()).toBe(text);
                expect(res.body.todo.completed).toBe(false);
                expect(res.body.todo.completed_at).toBeNull();
            })
            .end(done);
    });
});
Debugging
let todos = [];

const helperSeeder = () => {
     todos = [
        {
            _id: new ObjectID(),
            text,
            completed: false,
        },
        {
            _id: new ObjectID(),
            text,
            completed: false,
        },
        {
            _id: new ObjectID(),
            text,
            completed: false,
        },
    ];
    return Todo.insertMany(todos);
};
