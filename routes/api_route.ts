import { Router } from 'express';
import staticGZIP from 'express-static-gzip';
import { paths } from '../config';
import config from '../config.json';
import argon from 'argon2';
import { addUser, updateUser } from '../database/users';
import mailer from 'nodemailer';
import { inDev, thirtyDays } from '../constants';

const debug = require('debug')('ee:api');

const mailConfig = inDev
? {
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: config.auth.mailtrap.user,
      pass: config.auth.mailtrap.pass,
    }
  }
: {
  service: 'Mailgun',
  auth: {
    user: config.auth.mailgun.user,
    pass: config.auth.mailgun.pass
  }
};

const _transport = mailer.createTransport(mailConfig);

const _router = Router();

function verifyPasscode(passcode: string) {
  return argon.verify(config.auth.red33m, passcode);
}


type DataFileParams = { dir: string; file: string; }
;
_router.get<DataFileParams, any, any>('/data/:dir/:file?', (req, res, next) => {
  const { dir, file } = req.params;
  if (!req.isAuthorized) return res.sendStatus(403);

  req.url = file ? `${dir}/${file}` : `${dir}`;
  if (dir == 'red33m' && !req.isRed33med)
    return res.sendStatus(403)
  ;

  staticGZIP(`${paths.web}/_data`,
    { serveStatic: { maxAge: thirtyDays } }
  )(req, res, next);
});


_router.post<any, any, {userid:string}>('/auth/user', (req, res) => {
  const { userid } = req.body;

  if (   !req.isAuthorized
      || !userid || !userid.trim() || userid != req.id
  ) return res.status(403);

  if (userid.length < 30) return res.sendStatus(403);

  addUser(userid);
  res.sendStatus(200);
});


type AccessForm     = { name: string; email: string; questions: [text: string, answer: string][]; }
;
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
  })
  // Send Exclusive Content Form for Red33m access
  .post<any, any, AccessForm>((req, res) => {
    const { name, email, questions } = req.body;

    if (   !name                   || !name.trim().length  || name.length < 2
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