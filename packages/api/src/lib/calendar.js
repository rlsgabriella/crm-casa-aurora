import { google } from 'googleapis'

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary'

async function getCalendarClient() {
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  if (!credentialsPath) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS não configurado')
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: credentialsPath,
    scopes: ['https://www.googleapis.com/auth/calendar'],
  })

  return google.calendar({ version: 'v3', auth })
}

export async function criarEventoCalendar({ titulo, dataHora, horario, duracao = 120, descricao, email }) {
  const calendar = await getCalendarClient()

  const dataStr = dataHora instanceof Date
    ? dataHora.toISOString().split('T')[0]
    : String(dataHora).split('T')[0]

  const horaStr = horario || '12:00'
  const inicio = new Date(`${dataStr}T${horaStr}:00-03:00`)
  const fim = new Date(inicio.getTime() + duracao * 60000)

  const evento = {
    summary: titulo,
    description: descricao,
    start: {
      dateTime: inicio.toISOString(),
      timeZone: 'America/Fortaleza',
    },
    end: {
      dateTime: fim.toISOString(),
      timeZone: 'America/Fortaleza',
    },
    reminders: {
      useDefault: false,
      overrides: [{ method: 'popup', minutes: 60 }],
    },
  }

  if (email && email.includes('@')) {
    evento.attendees = [{ email }]
    evento.sendUpdates = 'all'
  }

  const result = await calendar.events.insert({
    calendarId: CALENDAR_ID,
    resource: evento,
  })

  return result.data
}
