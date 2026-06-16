import { prisma } from '@/lib/db'
import { getLogger } from '@/lib/logger'
import { hash } from 'bcryptjs'

const log = getLogger('api/reset-password')

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json()
    if (!token || !password) return Response.json({ error: 'Данные неполны' }, { status: 400 })
    if (password.length < 6) return Response.json({ error: 'Пароль минимум 6 символов' }, { status: 400 })

    const record = await prisma.passwordResetToken.findUnique({ where: { token } })

    if (!record || record.expiresAt < new Date()) {
      return Response.json({ error: 'Ссылка недействительна или истекла' }, { status: 400 })
    }

    const hashed = await hash(password, 12)
    await prisma.user.update({ where: { email: record.email }, data: { password: hashed } })
    await prisma.passwordResetToken.delete({ where: { token } })

    log.info('Пароль успешно сброшен', { email: record.email })
    return Response.json({ ok: true })
  } catch (error) {
    log.error('Ошибка применения нового пароля', error)
    return Response.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}
