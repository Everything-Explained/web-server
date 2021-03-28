import { Router, Request } from "express";
import mailer from 'nodemailer';
import { inDev } from "../../constants";
import config from '../../config.json';
import Mail from "nodemailer/lib/mailer";



type QnaForm         = { type: MailType, name: string; email: string; questions: QnaFormQuestion[]; }
type QnaFormQuestion = { text: string; answer: string }
type MailType        = 0|1|2|3;



const _mailConfig        = inDev ? config.mail.mailtrap : config.mail.mailgun;
const _transport         = mailer.createTransport(_mailConfig);
const _mailSubjects      = [
  "EvEx Form - I've got something to share",
  "EvEx Form - I want to collaborate",
  "EvEx Form - I want to correct you",
  "EvEx Form - Exclusive Content Request",
];
const _mailHTMLOpenDIV   = `<div style="background-color: #0f1112; box-sizing: border-box; padding: 20px 5px 20px 15px; height: 100%; width: 100%; color: hsl(197, 11%, 70%); font-size: 1.1rem; font-family: Verdana;">`;
const _mailHTMLOpenSPAN  = `<br><br><span style='color: hsl(161, 50%, 60%); font-weight: normal;'>`;
const _mailHTMLCloseSPAN = '</span><br><br><br><br>';
const _mailHTMLCloseDIV  = '</div>';



export function apiQnaFormRoute(router: Router) {
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


function isValidFormReq(req: Request<any, any, QnaForm>) {
  const { name, email, questions, type } = req.body
  ;
  return !(
       !name?.trim().match(/^[^(){}\-[\]!@#$%^&*_+=<>.,?'";:|\\/`~]{2,}$/i)
    || !email?.trim().match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i)
    || type < 0 || type > 3
    || !questions?.length
    || !questions[0].answer?.length
  );
}


function createEmail(form: QnaForm) {
  return {
    from    : `"${form.name}" <${form.email}>`,
    to      : 'ethankahn85@gmail.com',
    subject : _mailSubjects[form.type],
    html    : buildEmailMessage(form.questions)
  } as Mail.Options;
}


function buildEmailMessage(questions: QnaFormQuestion[]) {
  const questionHTML =
    questions.reduce((pv, q, i) => (
      pv += `${i+1}.) ${q.text}${_mailHTMLOpenSPAN}${q.answer}${_mailHTMLCloseSPAN}`
    ), '')
  ;
  return `${_mailHTMLOpenDIV}${questionHTML}${_mailHTMLCloseDIV}`;
}


