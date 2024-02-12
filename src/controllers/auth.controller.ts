import db from '$utils/database'
import { AuthService } from '$services/auth.service'
import { ControllerException, SUCCESS } from '$models/types'
import { DBException } from '$responses/exceptions/db-exception.response'
import { DataSuccess } from '$responses/success/data-success.response'
import { NextFunction } from 'express'
import { IncomingHttpHeaders } from 'http'
import { DefaultSuccess } from '$responses/success/default-success.response'
import jwt from '$utils/jwt'
import nexter from '$utils/nexter'

export default class Auth {
  async auth(headers: IncomingHttpHeaders): Promise<DataSuccess<{ jwt: string }>> {
    try {
      nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Basic'))
    } catch (error: unknown) {
      throw error as ControllerException
    }

    return new DataSuccess(200, SUCCESS, 'Success', { jwt: jwt.generate() })
  }

  async verify(headers: IncomingHttpHeaders): Promise<DataSuccess<{ jwt: string }>> {
    try {
      nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))
    } catch (error: unknown) {
      console.log(error)
      throw error as ControllerException
    }

    const token = (headers['authorization'] + '').split(' ')[1]

    return new DataSuccess(200, SUCCESS, 'Success', { jwt: token })
  }

  async logout(headers: IncomingHttpHeaders): Promise<DefaultSuccess> {
    try {
      nexter.serviceToException(await new AuthService().checkAuth(headers['authorization'] + '', 'Bearer'))
    } catch (error: unknown) {
      throw error as ControllerException
    }

    const token = (headers['authorization'] + '').split(' ')[1]

    try {
      await db.query('INSERT INTO exp_jwt (jwt) VALUES (?)', [token])
    } catch (error: any) {
      throw new DBException()
    }

    return new DefaultSuccess()
  }
}
