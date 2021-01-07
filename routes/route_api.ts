import { Router } from 'express';
import { loadStaticFrom } from '../utils';


const router = Router();


router.get('/pageData/:file', (req, res, next) => {
  if (!req.params.file) return next();
  req.url = req.params.file;
  res.setHeader('Cache-Control', 'no-cache');
  loadStaticFrom('../web-client/release/web_client/_data', 'no-cache')(req, res, next);
});

router.get('*', (req, res) => {
  res.sendStatus(404);
});


export = router;