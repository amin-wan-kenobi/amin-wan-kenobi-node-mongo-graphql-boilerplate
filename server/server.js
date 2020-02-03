import { } from './config';

import express from 'express';
import bodyParser from 'body-parser';
import fileUpload from 'express-fileupload';
import graphqlHttp from 'express-graphql';

import { connectToDB, } from './db/mongoose';
import allGraphQlSchema from './graphql/schema';
import graphQlResolver from './graphql/resolver';

import { pushRequiredDataIntoDB, } from './permissions/scripts';

let app = express();
const port = process.env.PORT;

app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(fileUpload());

/**
 * @api {GET} /api/v3/ Get No Information
 * @apiGroup NO_USE
 * @apiVersion 1.0.0
 * @apiName NoAPI
 * @apiDescription This API does not do anything and it is for test only
 * @apiHeaderExample {string} Header-Example:
 * "Content-Type":"application/json"
 * @apiSuccess (Success-Response-body) {number} status Status should be 200 (Example)
 * @apiSuccess (Success-Response-body) {string} message Message should be Happy Coding
 * @apiSuccess (Success-Response-body) {json} passedQueries anydata passed as query parameters will be in json format
 * @apiSuccessExample {json} Success-Response-Body:
 * {
 *     status: 200,
 *     message: 'Happy Coding',
 *     passedQueries: {
 *          q1: 'value1',
 *          q2: 'value2'
 *     }
 * }
 * @apiError (401) {json} ERROR Error query was received
 * @apiError (500) {json} NETWROK_ISSUE check the network
 *
 * @apiErrorExample {json} Error-Response-Body:
 * {
 *  "error": {
 *      "code": "SOME_CODE",
 *      "message": "SOME_MESSAGE"
 *  }
 * }
 */
app.get('/', async (req, res) => {
    await pushRequiredDataIntoDB();
    if (req.query && req.query.error) {
        res.status(401).send({
            error: {
                code: '1001',
                message: 'Error in query parameter',
            },
        });
    } else {
        res.send({
            status: 200,
            message: 'Happy Coding',
            passedQueries: req.query,
        });
    }
});

app.use('/graphql', graphqlHttp({
    schema: allGraphQlSchema,
    rootValue: graphQlResolver,
    graphiql: process.env.GRAPHIQL === 'true',
    customFormatErrorFn: (err) => {
        return {
            errorCode: err.message,
        };
    },
}));

connectToDB(process.env.MONGODB_URI)
    .then(() => {
        console.log(`MongoDB Connected to ****** ${process.env.NODE_ENV} ****** ${process.env.MONGODB_URI}`);
        app.listen(port, () => console.log(`Server started and listening to Port ${port}`));
    })
    .catch(e => {
        console.log('MongoDB Connection Error:', e);
        console.log('No server started');
    });


export { app, };
