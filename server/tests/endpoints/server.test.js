import request from 'supertest';
import expect from 'expect';
import { app, } from '../../server';

describe('---------------------- GET ROOT / ----------------------', () => {
    it('should return an object!!!', (done) => {
        request(app)
            .get('/')
            .expect(200)
            .expect((res) => {
                expect(res).toBeTruthy();
                expect(res.body.status).toBe(200);
                expect(res.body.message).toBe('Happy Coding');
                expect(res.body.passedQueries).toEqual({});
            })
            .end((err) => {
                if(err){
                    return done(err);
                }
                done();
            });
    });
    it('should receive query parameters', (done) => {
        request(app)
            .get('/?q1=queryone&q2=querytwo')
            .expect(200)
            .expect((res) => {
                expect(res).toBeTruthy();
                expect(res.body.status).toBe(200);
                expect(res.body.message).toBe('Happy Coding');
                expect(res.body.passedQueries).toBeTruthy();
                expect(res.body.passedQueries.q1).toBe('queryone');
                expect(res.body.passedQueries.q2).toBe('querytwo');
            })
            .end((err) => {
                if(err){
                    return done(err);
                }
                done();
            });
    });

    it('should respond with error if error is sent', (done) => {
        request(app)
            .get('/?error=12313')
            .expect(401)
            .expect((res) => {
                expect(res).toBeTruthy();
                expect(res.body).toBeTruthy();
                expect(res.body.error).toBeTruthy();
                expect(res.body.error.code).toBe('1001');
                expect(res.body.error.message).toBe('Error in query parameter');
            })
            .end((err) => {
                if(err){
                    return done(err);
                }
                done();
            });
    });
});