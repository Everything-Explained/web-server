import { Router } from 'express';
import staticGZIP from 'express-static-gzip';
import { paths } from '../config';
import config from '../config.json';
import argon from 'argon2';
import { addUser, getUserState, updateUser } from '../database/users';
import mailer from 'nodemailer';

const debug = require('debug')('ee:api');

const _transport = mailer.createTransport({
  service: 'Mailgun',
  auth: {
    user: config.auth.mailgun.user,
    pass: config.auth.mailgun.pass
  }
});

const _router = Router();

function verifyPasscode(passcode: string) {
  return argon.verify(config.auth.red33m, passcode);
}


type DataFileParams = { dir: string; file: string; }
;
_router.get<DataFileParams, any, any, {userid:string}>('/data/:dir/:file', (req, res, next) => {
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


_router.post<any, any, {userid:string}>('/auth/user', (req, res) => {
  const { userid } = req.body;
  if (!userid || !userid.trim()) return res.status(400).send('Missing ID');
  if (userid.length < 30)        return res.sendStatus(403);

  addUser(userid);
  res.sendStatus(200);
});


type Red33mPostBody = { passcode: string; userid: string }
type AccessForm     = { name: string; email: string; questions: [text: string, answer: string][]; }
;
_router.route('/auth/red33m')
  .put<any, any, Red33mPostBody>(async (req, res) => {
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
  })
  .post<any, any, AccessForm>((req, res) => {
    const { name, email, questions } = req.body;

    if (
           !name                   || !name.trim().length  || name.length < 2
        || !email                  || !email.trim().length || !email.includes('@')
        || !questions              || !questions.length    || questions.length != 5
        || !questions[0][1].length || !req.isAuthorized
    ) return res.sendStatus(403);

    _transport.sendMail({
      from: `"${name}" <${email}>`,
      to: 'ethankahn85@gmail.com',
      subject: 'Everything Explained - EC Form',
      html:
`<div style="background-color: #0f1112; box-sizing: border-box; padding: 20px 5px 20px 15px; height: 100%; width: 100%; color: hsl(197, 11%, 70%); font-size: 1.1rem; font-family: Verdana;">
${questions.reduce((pv, cv, i) => pv += `${i+1}.) ${cv[0]}<br><br><b style='color: hsl(161, 50%, 60%); font-weight: normal;'>${cv[1]}</b><br><br><br><br>`, '')}
</div>`
    })
    .then(() => res.sendStatus(200))
    .catch((err) => res.status(500).send(err.message));
  });


_router.get('*', (req, res) => {
  res.sendStatus(404);
});


export = _router;