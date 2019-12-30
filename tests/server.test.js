const expect = require('expect');
const request = require('supertest');

const app = require('./../server/server');
const Todo = require('./../server/models/todoModel');

let text = "Test Todo API";
let oldLength = 0;

beforeEach(done => {
    Todo.remove({text})
        .then(() => {
            done();
        })
        .catch(error => done(error));
});

afterEach(done => {
    Todo.find()
        .then(todos => {
            oldLength = todos.length - 1;
            done();
        })
        .catch(err => done(err));
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
                    console.log("{\n" + err + "\n}");
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

