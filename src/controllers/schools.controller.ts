import db from '$utils/database'
import { ControllerException, SUCCESS, count } from '$models/types'
import { DBException } from '$responses/exceptions/db-exception.response'
import { DataSuccess } from '$responses/success/data-success.response'
import { NextFunction } from 'express'
import { IncomingHttpHeaders } from 'http'
import nexter from '$utils/nexter'
import { AuthService } from '$services/auth.service'
import { RequestException } from '$responses/exceptions/request-exception.response'
import { School } from '$models/features/school.model'
import { Team } from '$models/features/team.model'
import Teams from './teams.controller'
import { Match } from '$models/features/match.model'
import Matches from './matches.controller'

export default class Schools {
  async getSchools(): Promise<DataSuccess<{ schools: School[] }>> {
    let schools: School[] = []

    try {
      schools = await db.query('SELECT * FROM schools ORDER BY category, name DESC')
    } catch (error: any) {
      throw new DBException()
    }

    return new DataSuccess(200, SUCCESS, 'Success', { schools })
  }

  async postSchool(headers: IncomingHttpHeaders, body: School): Promise<DataSuccess<{ schools: School[] }>> {
    try {
      nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))
    } catch (error: unknown) {
      throw error as ControllerException
    }

    if (!body.name || !body.category) {
      throw new RequestException('Missing parameters')
    }

    if (body.category !== 'C' && body.category !== 'L') {
      throw new RequestException('Invalid parameters')
    }

    let schoolCount: number
    try {
      schoolCount = (await db.query<count[]>('SELECT COUNT(*) AS count FROM schools WHERE name = ? AND category = ?', [body.name, body.category]))[0]
        .count
    } catch (error: any) {
      throw new DBException()
    }

    if (schoolCount > 0) {
      throw new RequestException('School already exists')
    }

    try {
      await db.query('INSERT INTO schools (name, category) VALUES (?, ?)', [body.name, body.category])
    } catch (error: any) {
      throw new DBException()
    }

    return this.getSchools()
  }

  async putSchool(headers: IncomingHttpHeaders, id: number, body: Partial<School>): Promise<DataSuccess<{ schools: School[] }>> {
    try {
      nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))
    } catch (error: unknown) {
      throw error as ControllerException
    }

    if (body && body.category !== 'C' && body.category !== 'L') {
      throw new RequestException('Invalid parameters')
    }

    let school: School
    try {
      school = (await db.query<School[]>('SELECT * FROM schools WHERE id = ?', [id]))[0]
    } catch (error: any) {
      throw new DBException()
    }
    if (!school || !school.id) {
      throw new RequestException('School not found')
    }

    let schoolCount: number
    try {
      schoolCount = (
        await db.query<count[]>('SELECT COUNT(*) AS count FROM schools WHERE name = ? AND category = ? AND id != ?', [body.name, body.category, id])
      )[0].count
    } catch (error: any) {
      throw new DBException()
    }
    if (schoolCount > 0) {
      throw new RequestException('School already exists')
    }

    try {
      await db.query('UPDATE schools SET name = ?, category = ? WHERE id = ?', [body.name || school.name, body.category || school.category, id])
    } catch (error: any) {
      throw new DBException()
    }

    return this.getSchools()
  }

  async deleteSchool(headers: IncomingHttpHeaders, id: number): Promise<DataSuccess<{ schools: School[]; teams: Team[]; matches: Match[] }>> {
    try {
      nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))
    } catch (error: unknown) {
      throw error as ControllerException
    }

    let school: School
    try {
      school = (await db.query<School[]>('SELECT * FROM schools WHERE id = ?', [id]))[0]
    } catch (error: any) {
      throw new DBException()
    }

    if (!school || !school.id) {
      throw new RequestException('School not found')
    }

    let teams: Team[]
    try {
      teams = await db.query<Team[]>('SELECT * FROM teams WHERE school = ?', [id])
    } catch (error: any) {
      throw new DBException()
    }

    teams.forEach(async (team) => {
      try {
        // Delete matches
        await db.query('DELETE FROM matches WHERE team1 = ? OR team2 = ?', [team.id, team.id])
      } catch (error: any) {
        throw new DBException()
      }
    })

    try {
      // Delete teams
      await db.query('DELETE FROM teams WHERE school = ?', [id])
    } catch (error: any) {
      throw new DBException()
    }

    try {
      // Delete school
      await db.query('DELETE FROM schools WHERE id = ?', [id])
    } catch (error: any) {
      throw new DBException()
    }

    return new DataSuccess(200, SUCCESS, 'Success', {
      schools: (await this.getSchools()).data.schools,
      teams: (await new Teams().getTeams()).data.teams,
      matches: (await new Matches().getMatches()).data.matches,
    })
  }
}
