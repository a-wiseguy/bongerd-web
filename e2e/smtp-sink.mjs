import { appendFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { simpleParser } from 'mailparser'
import { SMTPServer } from 'smtp-server'

// local stand-in for the real mail server: every mail becomes one json line
const log = path.resolve(process.env.E2E_MAIL_LOG ?? 'e2e/.artifacts/mails.jsonl')
const port = Number(process.env.E2E_SMTP_PORT ?? 2525)
mkdirSync(path.dirname(log), { recursive: true })

const server = new SMTPServer({
  authOptional: true,
  disabledCommands: ['STARTTLS'],
  onData(stream, _session, done) {
    simpleParser(stream)
      .then((mail) => {
        appendFileSync(log, `${JSON.stringify({ to: mail.to?.text, from: mail.from?.text, subject: mail.subject, text: mail.text })}\n`)
        done()
      })
      .catch(done)
  },
})
server.listen(port, '127.0.0.1', () => console.log(`smtp sink on 127.0.0.1:${port}, writing ${log}`))
