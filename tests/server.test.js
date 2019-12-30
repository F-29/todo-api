const expect = require('expect');
const request = require('supertest');

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


const helperSeeder = () => {
    const todos = [
        {text},
        {text},
        {text},
    ];
    return Todo.insertMany(todos);
};
