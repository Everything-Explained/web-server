import { Router } from 'express';
import staticGZIP from 'express-static-gzip';
import { paths } from '../config';
import config from '../config.json';
import argon from 'argon2';
import { addUser, getUserState, updateUser } from '../database/users';

const debug = require('debug')('ee:api');


const router = Router();

function verifyPasscode(passcode: string) {
  return argon.verify(config.auth.red33m, passcode);
}


type DataFileParams = { dir: string; file: string; }
;
router.get<DataFileParams, any, any, {userid:string}>('/data/:dir/:file', (req, res, next) => {
  const { dir, file } = req.params;
  const { userid } = req.query;
  if (!file) return next(); // Default to 404
  req.url = `${dir}/${file}`;
  if (file == 'red33m.json') {
    if (
         !userid
      || !userid.trim()
      || !getUserState(userid)
      || getUserState(userid) == 'nocode'
    ) { return res.sendStatus(403); }
  }
  res.setHeader('Cache-Control', 'public, no-cache');
  staticGZIP(`${paths.web}/_data`,
    { serveStatic: { cacheControl: false } }
  )(req, res, next);
});


router.post<any, any, {userid:string}>('/auth/user', (req, res) => {
  const { userid } = req.body;
  if (!userid || !userid.trim()) return res.status(400).send('Missing ID');
  if (userid.length < 30)        return res.sendStatus(403);

  addUser(userid);
  res.sendStatus(200);
});


type Red33mPostBody = { passcode: string; userid: string }
;
router.post<any, any, Red33mPostBody>('/auth/red33m', async (req, res) => {
  const { passcode, userid } = req.body;
  const userState = getUserState(userid);

  if (!userState)          return res.sendStatus(403);
  if (!passcode)           return res.status(400).send('Missing Passcode');
  if (userState == 'code') return res.status(400).send('Already Logged In');

  if (!await verifyPasscode(passcode))
    return res.status(400).send('Invalid Passcode')
  ;
  updateUser(userid, 'code');
  res.sendStatus(200);
});





router.get('*', (req, res) => {
  res.sendStatus(404);
});


export = router;