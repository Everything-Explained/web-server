import express from 'express';
import history from 'connect-history-api-fallback';
import spdy from 'spdy';
import { credentials } from './ssl/ssl';
import { cloudFlareIps, localHostIps, thirtyDays } from './constants';
import ipcheck from 'ip-range-check';
import staticGZIP from 'express-static-gzip';
import { inDev, paths } from './config';
const debug = require('debug')('ee:app');

const app = express();
const port = inDev ? 3003 : 443;

app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  if (ipcheck(req.ip, [...cloudFlareIps, ...localHostIps])) {
    return next();
  }
  // Deny direct access to server
  res.sendStatus(403);
});

// ADMIN Route placeholder
app.use((req, res, next) => {
  if (req.hostname.indexOf('admin.') == 0) {
    return res.sendStatus(403);
  }
  next();
});

if (inDev) {
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log(req.url);
    next();
  });
}

app.use('/api', require('./routes/api_route'));

// Rewrite request URL to index.html, if request is not a file
app.use(history());

// Default handler for all file requests
app.use('/',
  staticGZIP(paths.web, {
    serveStatic: {
      maxAge: thirtyDays
    }
  }
));

const server = spdy.createServer(credentials, app);
server.listen(port, '0.0.0.0', () => {
  console.log('Server Listening on Port', port);
});