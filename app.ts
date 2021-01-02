import express from 'express';
import history from 'connect-history-api-fallback';
import { loadStaticFrom } from './utils';
const debug = require('debug')('app');

const app = express();

app.use(express.urlencoded({ extended: false }));
if (process.env.NODE_ENV == 'development') {
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log(req.url);
    next();
  });
}

app.use('/api', require('./routes/route_api'));

// Rewrite request URL to index.html, if request is not a file
app.use(history());

// Default handler for all file requests
app.use('/', loadStaticFrom('../web-client/release/web_client', 'cache'));



app.listen(3003, '0.0.0.0', () => {
  console.log(`hello world on port 3003`);
});