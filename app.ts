import { inDev, inProd, thirtyDays } from './constants';
import express         from 'express';
import history         from 'connect-history-api-fallback';
import spdy            from 'spdy';
import { credentials } from './ssl/ssl';
import staticGZIP      from 'express-static-gzip';
import { paths }       from './config';
import { hasValidIP }  from './middleware/validate-ips';
import { allowOrigin } from './middleware/cors';
import { catchAuthorization } from './middleware/authorization';

const debug = require('debug')('ee:app');
const app = express();
const port = inDev ? 3003 : 443;


app.use(express.urlencoded({ extended: false }));

if (inProd) app.use(hasValidIP);
if (inDev)  app.use(allowOrigin('*'));

// ADMIN Route placeholder
app.use((req, res, next) => {
  if (req.hostname.indexOf('admin.') == 0) {
    return res.sendStatus(403);
  }
  next();
});


app.use(express.json());
app.use(catchAuthorization);
if (inDev) {
  app.use((req, res, next) => {
    debug(`REQ::${req.method}`, req.url, req.body, req.query);
    next();
  });
}
app.use('/api', require('./routes/api_route'));

if (inDev) {
  app.use((req, res, next) => {
    if (!req.url.includes('.')) res.setHeader('Cache-Control', `no-cache`);
    next();
  });
}

// Rewrite request to index.html, if request is not a file
app.use(history());

// Default handler for all file requests
app.use('/',
  staticGZIP(paths.web, {
    serveStatic: {
      maxAge: thirtyDays
    }
  }
));

if (inDev) {
  app.listen(port, () => {
    debug('Server Listening on Port', port);
  });
} else {
  const server = spdy.createServer(credentials, app);
  server.listen(port, '0.0.0.0', () => {
    debug('Server Listening on Port', port);
  });
}