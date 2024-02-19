import db from '$utils/database'
import { Live } from '$models/features/live.model'
import { ControllerException, SUCCESS, count } from '$models/types'
import { DBException } from '$responses/exceptions/db-exception.response'
import { DataSuccess } from '$responses/success/data-success.response'
import { IncomingHttpHeaders } from 'http'
import nexter from '$utils/nexter'
import { AuthService } from '$services/auth.service'
import { RequestException } from '$responses/exceptions/request-exception.response'
import { Match } from '$models/features/match.model'

export default class Lives {
  async getLives(headers: IncomingHttpHeaders): Promise<DataSuccess<{ lives: Live[] }>> {
    let auth = await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer')

    let lives: Live[] = []

    try {
      lives = auth.status
        ? await db.query('SELECT * FROM lives ORDER BY date DESC')
        : await db.query("SELECT * FROM lives WHERE status != 's' ORDER BY date ASC")
    } catch (error: any) {
      throw new DBException()
    }

    return new DataSuccess(200, SUCCESS, 'Success', { lives })
  }

  async postLive(headers: IncomingHttpHeaders, body: Live): Promise<DataSuccess<{ lives: Live[] }>> {
    try {
      nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))
    } catch (error: unknown) {
      throw error as ControllerException
    }

    if (!body.title || !body.date || !body.status || !body.url) {
      throw new RequestException('Missing parameters')
    }

    if (body.status !== 's' && body.status !== 'l' && body.status !== 'r') {
      throw new RequestException('Invalid parameters')
    }

    if (body.status === 'l') {
      let livesCount: number

      try {
        livesCount = (await db.query<count[]>("SELECT COUNT(*) AS count FROM lives WHERE status = 'l'"))[0].count
      } catch (error: any) {
        throw new DBException()
      }

      if (livesCount >= 1) {
        throw new RequestException('A live is already running')
      }
    }

    try {
      await db.query('INSERT INTO lives (title, date, status, url) VALUES (?, ?, ?, ?)', [body.title, body.date, body.status, body.url])
    } catch (error: any) {
      throw new DBException()
    }

    return this.getLives(headers)
  }

  async putLive(headers: IncomingHttpHeaders, id: number, body: Partial<Live>): Promise<DataSuccess<{ lives: Live[] }>> {
    try {
      nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))
    } catch (error: unknown) {
      throw error as ControllerException
    }

    if (body.status && body.status !== 's' && body.status !== 'l' && body.status !== 'r') {
      throw new RequestException('Invalid parameters')
    }

    let live: Live
    try {
      live = (await db.query<Live[]>('SELECT * FROM lives WHERE id = ?', [id]))[0]
    } catch (error: any) {
      throw new DBException()
    }

    if (!live || !live.id) {
      throw new RequestException('Live not found')
    }

    if (body.status && body.status === 'l') {
      let livesCount: number

      try {
        livesCount = (await db.query<count[]>("SELECT COUNT(*) AS count FROM lives WHERE status = 'l' AND id != ?", [id]))[0].count
      } catch (error: any) {
        throw new DBException()
      }

      if (livesCount >= 1) {
        throw new RequestException('A live is already running')
      }
    }

    try {
      await db.query('UPDATE lives SET title = ?, date = ?, status = ?, url = ? WHERE id = ?', [
        body.title || live.title,
        body.date || live.date,
        body.status || live.status,
        body.url || live.url,
        id
      ])
    } catch (error: any) {
      throw new DBException()
    }

    return this.getLives(headers)
  }

  async deleteLive(headers: IncomingHttpHeaders, id: number): Promise<DataSuccess<{ lives: Live[] }>> {
    try {
      nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))
    } catch (error: unknown) {
      throw error as ControllerException
    }

    let live: Live
    try {
      live = (await db.query<Live[]>('SELECT * FROM lives WHERE id = ?', [id]))[0]
    } catch (error: any) {
      throw new DBException()
    }

    if (!live || !live.id) {
      throw new RequestException('Live not found')
    }

    try {
      await db.query('DELETE FROM lives WHERE id = ?', [id])
    } catch (error: any) {
      throw new DBException()
    }

    return this.getLives(headers)
  }
}
