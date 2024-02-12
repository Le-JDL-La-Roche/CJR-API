import db from '$utils/database'
import { ControllerException, SUCCESS, count } from '$models/types'
import { DBException } from '$responses/exceptions/db-exception.response'
import { DataSuccess } from '$responses/success/data-success.response'
import { NextFunction } from 'express'
import { IncomingHttpHeaders } from 'http'
import nexter from '$utils/nexter'
import { AuthService } from '$services/auth.service'
import { RequestException } from '$responses/exceptions/request-exception.response'
import { Team } from '$models/features/team.model'
import { Match } from '$models/features/match.model'

export default class Teams {
  async getTeams(): Promise<DataSuccess<{ teams: Team[] }>> {
    let teams: Team[] = []

    try {
      teams = await db.query('SELECT * FROM teams ORDER BY name')
    } catch (error: any) {
      throw new DBException()
    }

    return new DataSuccess(200, SUCCESS, 'Success', { teams })
  }

  async postTeam(headers: IncomingHttpHeaders, body: Team): Promise<DataSuccess<{ teams: Team[] }>> {
    try {
      nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))
    } catch (error: unknown) {
      throw error as ControllerException
    }

    if (!body.name || !body.school || !body.teammates) {
      throw new RequestException('Missing parameters')
    }

    let schoolCount: number
    try {
      schoolCount = (await db.query<count[]>('SELECT COUNT(*) AS count FROM schools WHERE id = ?', [+body.school]))[0].count
    } catch (error: any) {
      throw new DBException()
    }

    if (schoolCount === 0) {
      throw new RequestException('School not found')
    }

    let teamCount: number
    try {
      teamCount = (await db.query<count[]>('SELECT COUNT(*) AS count FROM teams WHERE name = ? AND school = ?', [body.name, body.school]))[0].count
    } catch (error: any) {
      throw new DBException()
    }

    if (teamCount > 0) {
      throw new RequestException('Team already exists')
    }

    try {
      await db.query('INSERT INTO teams (name, school, teammates) VALUES (?, ?, ?)', [body.name, body.school, body.teammates])
    } catch (error: any) {
      throw new DBException()
    }

    return this.getTeams()
  }

  async putTeam(headers: IncomingHttpHeaders, id: number, body: Partial<Team>): Promise<DataSuccess<{ teams: Team[] }>> {
    try {
      nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))
    } catch (error: unknown) {
      throw error as ControllerException
    }

    let team: Team
    try {
      team = (await db.query<Team[]>('SELECT * FROM teams WHERE id = ?', [id]))[0]
    } catch (error: any) {
      throw new DBException()
    }
    if (!team || !team.id) {
      throw new RequestException('Team not found')
    }

    let teamCount: number
    try {
      teamCount = (await db.query<count[]>('SELECT COUNT(*) AS count FROM teams WHERE name = ? AND school = ? AND id != ?', [body.name, body.school, id]))[0]
        .count
    } catch (error: any) {
      throw new DBException()
    }
    if (teamCount > 0) {
      throw new RequestException('Team already exists')
    }

    if (body.school) {
      let schoolCount: number
      try {
        schoolCount = (await db.query<count[]>('SELECT COUNT(*) AS count FROM schools WHERE id = ?', [+body.school]))[0].count
      } catch (error: any) {
        throw new DBException()
      }

      if (schoolCount === 0) {
        throw new RequestException('School not found')
      }
    }

    try {
      await db.query('UPDATE teams SET name = ?, school = ?, teammates = ? WHERE id = ?', [
        body.name || team.name,
        body.school || team.school,
        body.teammates || team.teammates,
        id
      ])
    } catch (error: any) {
      throw new DBException()
    }

    return this.getTeams()
  }

  async deleteTeam(headers: IncomingHttpHeaders, id: number): Promise<DataSuccess<{ teams: Team[], matches: Match[] }>> {
    try {
      nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))
    } catch (error: unknown) {
      throw error as ControllerException
    }

    let team: Team
    try {
      team = (await db.query<Team[]>('SELECT * FROM teams WHERE id = ?', [id]))[0]
    } catch (error: any) {
      throw new DBException()
    }

    if (!team || !team.id) {
      throw new RequestException('Team not found')
    }

    try {
      await db.query('DELETE FROM matches WHERE team1 = ? OR team2 = ?', [id, id])
    } catch (error: any) {
      throw new DBException()
    }

    try {
      await db.query('DELETE FROM teams WHERE id = ?', [id])
    } catch (error: any) {
      throw new DBException()
    }

    return new DataSuccess(200, SUCCESS, 'Success', {
      teams: (await this.getTeams()).data.teams,
      matches: []
    })
  }
}
