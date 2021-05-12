import { Router, Request } from "express";
import mailer from 'nodemailer';
import { inDev } from "../../constants";
import config from '../../config.json';
import Mail from "nodemailer/lib/mailer";



type QnaForm         = { type: MailType, name: string; email: string; questions: QnaFormQuestion[]; }
type QnaFormQuestion = { text: string; answer: string }


enum MailType {
  SHAREWITHUS = 0,
  COLLABORATEWITHUS,
  CORRECTUS,
  RED33MFORM,
}

const _mailConfig        = inDev ? config.mail.mailtrap : config.mail.sendinblue;
const _transport         = mailer.createTransport(_mailConfig);


export function useQnaFormRoute(router: Router) {
  const route = router.route('/form/qna')
  ;
  route.post<any, any, QnaForm>((req, res) => {
    if (!req.isAuthorized || !isValidFormReq(req))
      return res.sendStatus(403)
    ;
    _transport
      .sendMail(createEmail(req.body))
      .then(() => res.sendStatus(200))
      .catch((err) => res.status(500).send(err.message))
    ;
  });
}


const _mailSubjects = [
  "EvEx Form - I've got something to share",
  "EvEx Form - I want to collaborate",
  "EvEx Form - I want to correct you",
  "EvEx Form - Exclusive Content Request",
];


function isValidFormReq(req: Request<any, any, QnaForm>) {
  const { name, email, questions, type } = req.body
  ;
  return !(
       !name?.trim().match(/^[a-z\s.]{2,}$/i)
    || !email?.trim().match(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i)
    || !Number.isFinite(type) || !_mailSubjects[type]
    || !questions?.length
    || !questions[0].answer?.length
  );
}


function createEmail(form: QnaForm) {
  return {
    from    : `"${form.name}" <${form.email}>`,
    to      : config.mail.toEthan,
    subject : _mailSubjects[form.type],
    html    : buildHTMLMessage(form.questions),
    text    : buildTextMessage(form.questions),
  } as Mail.Options;
}


const _mailHTMLOpenDIV =
'<html><body style="background-color: #0f1112; \
color: hsl(197, 11%, 70%); \
font-size: 18px; font-family: Verdana;">'
;
const _mailHTMLOpenSPAN  = `<br><br><span style='color: hsl(161, 50%, 60%);'>`;
const _mailHTMLCloseSPAN = '</span><br><br><br>';
const _mailHTMLCloseDIV  = '</body></html>';


function buildHTMLMessage(questions: QnaFormQuestion[]) {
  const questionHTML =
    questions.reduce((pv, q, i) => (
      pv += `${i+1}.) ${q.text}${_mailHTMLOpenSPAN}${q.answer}${_mailHTMLCloseSPAN}`
    ), '')
  ;
  return `${_mailHTMLOpenDIV}${questionHTML}${_mailHTMLCloseDIV}`;
}


function buildTextMessage(questions: QnaFormQuestion[]) {
  return questions.reduce((pv, q, i) => {
    return pv += `${i+1}) ${q.text}\n\n${q.answer}\n\n\n\n`;
  }, '');
}


