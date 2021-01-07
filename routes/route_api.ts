import { Router } from 'express';
import staticGZIP from 'express-static-gzip';


const router = Router();


router.get('/pageData/:file', (req, res, next) => {
  if (!req.params.file) return next();
  req.url = `/${req.params.file}`;
  res.setHeader('Cache-Control', 'no-cache');
  staticGZIP('../web-client/release/web_client/_data',
    { serveStatic: { cacheControl: false } }
  )(req, res, next);
});

router.get('*', (req, res) => {
  res.sendStatus(404);
});


export = router;