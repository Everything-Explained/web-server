import { Router } from 'express';
import staticGZIP from 'express-static-gzip';
import { paths } from '../config';


const router = Router();


router.get('/pageData/:file', (req, res, next) => {
  if (!req.params.file) return next();
  req.url = `/${req.params.file}`;
  res.setHeader('Cache-Control', 'public, no-cache');
  staticGZIP(`${paths.web}/_data`,
    { serveStatic: { cacheControl: false } }
  )(req, res, next);
});

router.get('*', (req, res) => {
  res.sendStatus(404);
});


export = router;