import db from '$utils/database'
import { ControllerException, SUCCESS, count } from '$models/types'
import { DBException } from '$responses/exceptions/db-exception.response'
import { DataSuccess } from '$responses/success/data-success.response'
import { NextFunction } from 'express'
import { IncomingHttpHeaders } from 'http'
import nexter from '$utils/nexter'
import { AuthService } from '$services/auth.service'
import { RequestException } from '$responses/exceptions/request-exception.response'
import { Match } from '$models/features/match.model'

export default class Matches {
  async getMatches(): Promise<DataSuccess<{ matches: Match[] }>> {
    let matches: Match[] = []

    try {
      matches = await db.query('SELECT * FROM matches ORDER BY from_date DESC')
    } catch (error: any) {
      throw new DBException()
    }

    return new DataSuccess(200, SUCCESS, 'Success', { matches })
  }

  async postMatch(headers: IncomingHttpHeaders, body: Match): Promise<DataSuccess<{ matches: Match[] }>> {
    try {
      nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))
    } catch (error: unknown) {
      throw error as ControllerException
    }

    if (!body.team1 || !body.team2 || !body.fromDate || !body.toDate || !body.category || !body.field) {
      throw new RequestException('Missing parameters')
    }

    if ((body.category !== 'C' && body.category !== 'L') || body.fromDate >= body.toDate) {
      throw new RequestException('Invalid parameters')
    }

    let team1Count: number
    let team2Count: number
    try {
      team1Count = (await db.query<count[]>('SELECT COUNT(*) AS count FROM teams WHERE id = ?', [body.team1]))[0].count
      team2Count = (await db.query<count[]>('SELECT COUNT(*) AS count FROM teams WHERE id = ?', [body.team2]))[0].count
    } catch (error: any) {
      throw new DBException()
    }

    if (team1Count === 0 || team2Count === 0) {
      throw new RequestException('Team(s) not found')
    }

    if (new Date(body.fromDate) >= new Date(body.toDate)) {
      throw new RequestException('Invalid dates')
    }

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

    if (body.score1 && body.score2 && body.score1 != 0 && body.score2 != 0 && body.score1 === body.score2) {
      throw new RequestException('Invalid score')
    }

    try {
      await db.query(
        'INSERT INTO matches (team1, team2, score1, score2, category, from_date, to_date, field, tree) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [body.team1, body.team2, body.score1 || 0, body.score2 || 0, body.category, body.fromDate, body.toDate, body.field, body.tree || 0]
      )
    } catch (error: any) {
      throw new DBException()
    }

    return this.getMatches()
  }

  async putMatch(headers: IncomingHttpHeaders, id: number, body: Partial<Match>): Promise<DataSuccess<{ matches: Match[] }>> {
    try {
      nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))
    } catch (error: unknown) {
      throw error as ControllerException
    }

    let match: Match
    try {
      match = (await db.query<Match[]>('SELECT * FROM matches WHERE id = ?', [id]))[0]
    } catch (error: any) {
      throw new DBException(error)
    }
    if (!match || !match.id) {
      throw new RequestException('Match not found')
    }

    if ((body.category && body.category !== 'C' && body.category !== 'L') || (body.fromDate && body.toDate && body.fromDate >= body.toDate)) {
      throw new RequestException('Invalid parameters')
    }

    if (match.score1 || match.score2) {
      throw new RequestException('Match already played')
    }

    let team1Count: number = 1
    let team2Count: number = 1
    if (body.team1) {
      try {
        team1Count = (await db.query<count[]>('SELECT COUNT(*) AS count FROM teams WHERE id = ?', [body.team1]))[0].count
      } catch (error: any) {
        throw new DBException()
      }
    }
    if (body.team2) {
      try {
        team1Count = (await db.query<count[]>('SELECT COUNT(*) AS count FROM teams WHERE id = ?', [body.team1]))[0].count
      } catch (error: any) {
        throw new DBException()
      }
    }
    if (team1Count === 0 || team2Count === 0) {
      throw new RequestException('Team(s) not found')
    }

    const fromDate = body.fromDate || match.fromDate
    const toDate = body.toDate || match.toDate
    if (new Date(fromDate) >= new Date(toDate)) {
      throw new RequestException('Invalid dates')
    }

    let matches: Match[]
    try {
      matches = await db.query<Match[]>('SELECT * FROM matches WHERE field = ? AND id != ?', [body.field || match.field, id])
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

    if (body.score1 && body.score2 && body.score1 != 0 && body.score2 != 0 && body.score1 === body.score2) {
      throw new RequestException('Invalid score')
    }

    try {
      await db.query(
        'UPDATE matches SET team1 = ?, team2 = ?, score1 = ?, score2 = ?, category = ?, from_date = ?, to_date = ?, field = ?, tree = ? WHERE id = ?',
        [
          body.team1 || match.team1,
          body.team2 || match.team2,
          body.score1 || match.score1,
          body.score2 || match.score2,
          body.category || match.category,
          body.fromDate || match.fromDate,
          body.toDate || match.toDate,
          body.field || match.field,
          body.tree || match.tree,
          id
        ]
      )
    } catch (error: any) {
      throw new DBException('4')
    }

    return this.getMatches()
  }

  async deleteMatch(headers: IncomingHttpHeaders, id: number): Promise<DataSuccess<{ matches: Match[] }>> {
    try {
      nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))
    } catch (error: unknown) {
      throw error as ControllerException
    }

    let match: Match
    try {
      match = (await db.query<Match[]>('SELECT * FROM matches WHERE id = ?', [id]))[0]
    } catch (error: any) {
      throw new DBException()
    }

    if (!match || !match.id) {
      throw new RequestException('Match not found')
    }

    if (match.score1 || match.score2) {
      throw new RequestException('Match already played')
    }

    try {
      await db.query('DELETE FROM matches WHERE id = ?', [id])
    } catch (error: any) {
      throw new DBException()
    }

    return new DataSuccess(200, SUCCESS, 'Success', {
      matches: (await this.getMatches()).data.matches
    })
  }
}
