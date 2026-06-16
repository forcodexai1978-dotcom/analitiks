import nodemailer from 'nodemailer'
import { getLogger } from './logger'

const log = getLogger('mailer')

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendPasswordResetEmail(email: string, token: string) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const resetUrl = `${baseUrl}/reset-password?token=${token}`

  log.info('Отправка письма сброса пароля', { email })

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: 'Сброс пароля — CRM Система',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #1e293b; margin-bottom: 8px;">Сброс пароля</h2>
        <p style="color: #64748b; margin-bottom: 24px;">
          Вы запросили сброс пароля для вашей учётной записи CRM.<br>
          Ссылка действует <strong>1 час</strong>.
        </p>
        <a href="${resetUrl}"
           style="display: inline-block; background: #4f46e5; color: #fff;
                  padding: 12px 24px; border-radius: 8px; text-decoration: none;
                  font-weight: 600; font-size: 15px;">
          Сбросить пароль
        </a>
        <p style="color: #94a3b8; font-size: 13px; margin-top: 24px;">
          Если вы не запрашивали сброс — просто проигнорируйте это письмо.
        </p>
      </div>
    `,
  })
}
