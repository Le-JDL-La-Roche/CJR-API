import db from '$utils/database'
import { Event } from '$models/features/agenda.model'
import { ControllerException, SUCCESS } from '$models/types'
import { DBException } from '$responses/exceptions/db-exception.response'
import { DataSuccess } from '$responses/success/data-success.response'
import { IncomingHttpHeaders } from 'http'
import nexter from '$utils/nexter'
import { AuthService } from '$services/auth.service'
import { RequestException } from '$responses/exceptions/request-exception.response'
import { Match } from '$models/features/match.model'

export default class Agenda {
  async getEvents(headers: IncomingHttpHeaders): Promise<DataSuccess<{ events: Event[] }>> {
    let auth = await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer')

    let events: Event[] = []

    try {
      events = auth.status
        ? await db.query('SELECT * FROM agenda ORDER BY from_date DESC')
        : await db.query('SELECT * FROM agenda WHERE status = 1 ORDER BY from_date DESC')
    } catch (error: any) {
      throw new DBException()
    }

    return new DataSuccess(200, SUCCESS, 'Success', { events })
  }

  async postEvent(headers: IncomingHttpHeaders, body: Event): Promise<DataSuccess<{ events: Event[] }>> {
    try {
      nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))
    } catch (error: unknown) {
      throw error as ControllerException
    }

    if (!body.title || !body.fromDate || !body.category || !body.status) {
      throw new RequestException('Missing parameters')
    }

    if (body.category !== 'C' && body.category !== 'L' && body.category !== 'g') {
      throw new RequestException('Invalid parameters')
    }

    if (body.field == 0) {
      body.category = 'g'
      body.toDate = ''
    } else if (body.field != 1 && body.field != 2 && body.field != 3 && body.field != 4) {
      throw new RequestException('Invalid parameters')
    }

    if (new Date(body.fromDate) >= new Date(body.toDate)) {
      throw new RequestException('Invalid dates')
    }

    if (body.field != 0) {
      let matches: Match[]
      try {
        matches = await db.query<Match[]>('SELECT * FROM matches WHERE field = ?', [body.field])
      } catch (error: any) {
        throw new DBException()
      }

      matches.forEach((m) => {
        if (
          (new Date(body.fromDate) >= new Date(m.fromDate) && new Date(body.fromDate) < new Date(m.toDate)) ||
          (new Date(body.toDate) >= new Date(m.fromDate) && new Date(body.toDate) <= new Date(m.toDate)) ||
          (new Date(body.fromDate!) <= new Date(m.fromDate) && new Date(body.toDate!) >= new Date(m.toDate))
        ) {
          throw new RequestException('Field already booked')
        }
      })

      let events: Match[]
      try {
        events = await db.query<Match[]>('SELECT * FROM agenda WHERE field = ?', [body.field])
      } catch (error: any) {
        throw new DBException()
      }

      events.forEach((e) => {
        if (
          (new Date(body.fromDate) >= new Date(e.fromDate) && new Date(body.fromDate) < new Date(e.toDate)) ||
          (new Date(body.toDate) >= new Date(e.fromDate) && new Date(body.toDate) <= new Date(e.toDate)) ||
          (new Date(body.fromDate!) <= new Date(e.fromDate) && new Date(body.toDate!) >= new Date(e.toDate))
        ) {
          throw new RequestException('Field already booked')
        }
      })
    }

    try {
      await db.query('INSERT INTO agenda (from_date, to_date, title, content, field, category, status) VALUES (?, ?, ?, ?, ?, ?, ?)', [
        body.fromDate,
        body.toDate,
        body.title,
        body.content || '',
        body.field,
        body.category,
        body.status
      ])
    } catch (error: any) {
      throw new DBException()
    }

    return this.getEvents(headers)
  }

  async putEvent(headers: IncomingHttpHeaders, id: number, body: Partial<Event>): Promise<DataSuccess<{ events: Event[] }>> {
    try {
      nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))
    } catch (error: unknown) {
      throw error as ControllerException
    }

    if (body.category && body.category !== 'C' && body.category !== 'L' && body.category !== 'g') {
      throw new RequestException('Invalid parameters')
    }

    if (body.field && body.field == 0) {
      body.category = 'g'
      body.toDate = ''
    } else if (body.field && body.field != 1 && body.field != 2 && body.field != 3 && body.field != 4) {
      throw new RequestException('Invalid parameters')
    }

    let event: Event
    try {
      event = (await db.query<Event[]>('SELECT * FROM agenda WHERE id = ?', [id]))[0]
    } catch (error: any) {
      throw new DBException()
    }

    if (!event || !event.id) {
      throw new RequestException('Event not found')
    }

    const fromDate = body.fromDate || event.fromDate
    const toDate = body.toDate || event.toDate

    if (new Date(fromDate) >= new Date(toDate)) {
      throw new RequestException('Invalid dates')
    }

    if ((body.field && body.field != 0) || (!body.field && event.field && event.field != 0)) {
      let matches: Match[]
      try {
        matches = await db.query<Match[]>('SELECT * FROM matches WHERE field = ?', [body.field || event.field])
      } catch (error: any) {
        throw new DBException()
      }

      if (body.fromDate && body.fromDate && body.toDate && body.toDate && matches.length > 0) {
        matches.forEach((m) => {
          if (
            (new Date(body.fromDate!) >= new Date(m.fromDate) && new Date(body.fromDate!) < new Date(m.toDate)) ||
            (new Date(body.toDate!) >= new Date(m.fromDate) && new Date(body.toDate!) <= new Date(m.toDate)) ||
            (new Date(body.fromDate!) <= new Date(m.fromDate) && new Date(body.toDate!) >= new Date(m.toDate))
          ) {
            throw new RequestException('Field already booked')
          }
        })
      }

      let events: Event[]
      try {
        events = await db.query<Event[]>('SELECT * FROM agenda WHERE field = ? AND id != ?', [body.field || event.field, id])
      } catch (error: any) {
        throw new DBException()
      }

      if (body.fromDate && body.fromDate && body.toDate && body.toDate && events.length > 0) {
        events.forEach((e) => {
          if (
            (new Date(body.fromDate!) >= new Date(e.fromDate) && new Date(body.fromDate!) < new Date(e.toDate)) ||
            (new Date(body.toDate!) >= new Date(e.fromDate) && new Date(body.toDate!) <= new Date(e.toDate)) ||
            (new Date(body.fromDate!) <= new Date(e.fromDate) && new Date(e.toDate!) >= new Date(e.toDate))
          ) {
            throw new RequestException('Field already booked')
          }
        })
      }
    }

    try {
      await db.query('UPDATE agenda SET from_date = ?, to_date = ?, title = ?, content = ?, field = ?, category = ?, status = ? WHERE id = ?', [
        body.fromDate || event.fromDate,
        body.toDate || event.toDate,
        body.title || event.title,
        body.content || event.content,
        body.field || event.field,
        body.category || event.category,
        body.status || event.status,
        id
      ])
    } catch (error: any) {
      throw new DBException()
    }

    return this.getEvents(headers)
  }

  async deleteEvent(headers: IncomingHttpHeaders, id: number): Promise<DataSuccess<{ events: Event[] }>> {
    try {
      nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))
    } catch (error: unknown) {
      throw error as ControllerException
    }

    let event: Event
    try {
      event = (await db.query<Event[]>('SELECT * FROM agenda WHERE id = ?', [id]))[0]
    } catch (error: any) {
      throw new DBException()
    }

    if (!event || !event.id) {
      throw new RequestException('Event not found')
    }

    try {
      await db.query('DELETE FROM agenda WHERE id = ?', [id])
    } catch (error: any) {
      throw new DBException()
    }

    return this.getEvents(headers)
  }
}
