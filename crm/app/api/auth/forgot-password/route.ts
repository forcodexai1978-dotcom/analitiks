import { prisma } from '@/lib/db'
import { sendPasswordResetEmail } from '@/lib/mailer'
import { getLogger } from '@/lib/logger'
import crypto from 'crypto'

const log = getLogger('api/forgot-password')

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email) return Response.json({ error: 'Email обязателен' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { email } })

    // Отвечаем одинаково независимо от того, найден ли пользователь
    if (user) {
      await prisma.passwordResetToken.deleteMany({ where: { email } })

      const token = crypto.randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 час

      await prisma.passwordResetToken.create({ data: { token, email, expiresAt } })

      await sendPasswordResetEmail(email, token)
      log.info('Токен сброса пароля создан', { email })
    } else {
      log.warn('Запрос сброса для несуществующего email', { email })
    }

    return Response.json({ ok: true })
  } catch (error) {
    log.error('Ошибка сброса пароля', error)
    return Response.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}
