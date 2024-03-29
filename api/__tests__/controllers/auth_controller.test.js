// set test env
process.env.NODE_ENV = 'test';
const express = require('express');
const app = express();
const api = require('../../server');
app.use(api);

const async = require('async');
const agent = require('supertest').agent(app.listen());

/************************** CLEAN DATABASE **************************** */
const userRepository = require('../../repositories/user_repo');
// afterEach(() => {
//     userRepository.cleanTable((cleaned)=>{
//         expect(cleaned).toEqual("cleaned");
//     });
// });
beforeEach(() => {
    userRepository.cleanTable((cleaned)=>{
        expect(cleaned).toEqual("cleaned");
    });
});
/********************************************************************** */

const credentials = {
    "email":"a@a.com",
    "password":"123123"
};

test('GET /hei - Health check ', (done) => {
    // return (do not shutdown app after)
    return agent
        .get('/hei')
        .end((err, res) => {
            // console.log(res);
            expect(res.statusCode).toBe(200);
            expect(res.body.ack).toBe('true');
            done()
        });
});

test('POST /users - Register new user', (done) => {
    return agent
        .post('/users')
        .send(credentials)
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('Accept', 'application/json; charset=utf-8')
        .end(function (err, res) {
            expect(res.statusCode).toBe(201);
            done();
        });
});

test('POST /login - Invalid credentials',  (done) => {
    return agent
        .post('/login')
        .send(credentials)
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('Accept', 'application/json; charset=utf-8')
        .end(function (err, res) {
            expect(res.statusCode).toBe(404);
            done();
        });
});

test('POST /login - With valid token | UGLY callback',  (done) => {
    return agent
        .post('/users')
        .send(credentials)
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('Accept', 'application/json; charset=utf-8')
        .end(function (err, res) {
            expect(res.statusCode).toBe(201);
            return agent
                .post('/login')
                .send(credentials)
                .set('Content-Type', 'application/json; charset=utf-8')
                .set('Accept', 'application/json; charset=utf-8')
                .end((err, res) => {
                    expect(res.statusCode).toBe(200);
                    expect(res.body.token).not.toBeNull()
                    done();
                });
        });
});

test('POST /login - With valid token | Vanila callback',  (done) => {
    var token = 'asd';
    async.series([
            function(cb) {
                agent
                    .post('/users')
                    .send(credentials)
                    .set('Content-Type', 'application/json; charset=utf-8')
                    .set('Accept', 'application/json; charset=utf-8').expect(201, cb);
            },
            function(cb) {
                agent.post('/login')
                    .send(credentials)
                    .set('Content-Type', 'application/json; charset=utf-8')
                    .set('Accept', 'application/json; charset=utf-8')
                    .expect(200).end((err,res)=>{
                        // console.log(res.body);
                        expect(res.body.token).not.toBeNull()
                        token=res.body.token
                        cb()
                    })
            }
    ], done);
});

test('GET /users - No token', (done) => {
    // return (do not shutdown app after)
    return agent
        .get('/users')
        .expect('Content-Type', "text/html; charset=utf-8")
        .end((err, res) => {
            expect(res.statusCode).toBe(401);
            expect(res.text).toBe('Include a token plz');
            done()
        });
});

test('GET /users - With token', (done) => {
    getToken((token)=>{
        return agent
            .get('/users')
            .set('Authorization',token)
            .expect(200)
            .end((err, res) => {
                expect(res.body[0].email).toBe(credentials.email);
                done()
            });
    });
});

test('GET /me - With token', (done) => {
    getToken((token)=>{
        return agent
            .get('/me')
            .set('Authorization',token)
            .expect(200)
            .end((err, res) => {
                expect(res.body.email).toBe(credentials.email);
                done()
            });
    });
});


test('GET /me - Invalid token', (done) => {
        return agent
            .get('/me')
            .set('Authorization',"invalid token")
            .expect(401)
            .end(() => done());
});

const getToken = function(mainCb) {
    async.series([
        function(cb) {
            agent
                .post('/users')
                .send(credentials)
                .set('Content-Type', 'application/json; charset=utf-8')
                .set('Accept', 'application/json; charset=utf-8').expect(201, cb);
        },
        function(cb) {
            agent.post('/login')
                .send(credentials)
                .set('Content-Type', 'application/json; charset=utf-8')
                .set('Accept', 'application/json; charset=utf-8')
                .expect(200).end((err,res)=>{
                // console.log(res.body);
                expect(res.body.token).not.toBeNull();
                mainCb(res.body.token);
                cb()
            })
        }
    ]);
};




