import { Route } from '$models/handle/route.model'
import { Router, NextFunction } from 'express'
import { Request, Response } from 'express'
import Agenda from '$controllers/agenda.controller'
import { DataHttpResponse } from '$models/responses/http/data-http-response.model'
import { Event } from '$models/features/agenda.model'
import { FilesService } from '$services/files.service'
import { ControllerException } from '$models/types'

export default class AgendaRouter implements Route {
  router = Router()
  path = '/agenda'

  constructor() {
    this.init()
  }

  private init() {}
}
