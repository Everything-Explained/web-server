import { Router } from 'express';
import staticGZIP from 'express-static-gzip';
import { paths } from '../config';
import config from '../config.json';
import argon from 'argon2';
import { addUser, updateUser } from '../database/users';
import { yearInMs } from '../constants';
import { readFile } from 'fs/promises';
import { useQnaFormRoute } from './api/useQnAForm';


const _router = Router();
const _staticData = staticGZIP(`${paths.web}/_data`, { serveStatic: { maxAge: yearInMs } });


function verifyPasscode(passcode: string) {
  return argon.verify(config.auth.red33m, passcode);
}


type DataFileParams = { dir: string; file: string; }
;
_router.get<DataFileParams, any, any>('/data/:dir/:file?', (req, res, next) => {
  const { dir, file } = req.params;
  if (!req.isAuthorized) return res.sendStatus(403);

  req.url = file ? `/${dir}/${file}` : `/${dir}`;
  if (dir == 'red33m' && !req.isRed33med)
    return res.sendStatus(403)
  ;
  _staticData(req, res, next);
});


type SetupParams = { userid: string; }
;
_router.get<any, any, any, SetupParams>('/auth/setup', async (req, res) => {
  const { userid } = req.query;
  const version = (await readFile(`${paths.web}/version.json`)).toString();

  // User already exists
  if (req.isAuthorized) {
    return res.send(version);
  }

  if (   !req.hasValidID
      || !userid || !userid.trim() || userid != req.id
  ) return res.sendStatus(403);

  if (userid.length < 30) return res.sendStatus(403);

  addUser(userid);
  res.status(201).send(version);
});


_router.route('/auth/red33m')
  // Authenticate with passcode
  .put<any, any, {passcode:string}>(async (req, res) => {
    const { passcode } = req.body;

    if (   !req.isAuthorized
        || !passcode || !passcode.trim().length
    ) return res.sendStatus(403);

    if (req.isRed33med) return res.status(400).send('Already Logged In');

    if (!await verifyPasscode(passcode))
      return res.status(400).send('Invalid Passcode')
    ;
    updateUser(req.id!, 'code');
    res.sendStatus(200);
  });


useQnaFormRoute(_router);


_router.get('*', (req, res) => {
  res.sendStatus(404);
});


export = _router;