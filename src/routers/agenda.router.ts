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

  private init() {
    /**
     * @openapi
     * /agenda:
     *   get:
     *     tags:
     *       - Agenda
     *     security:
     *       - bearer: []
     *     summary: Get the events
     *     responses:
     *       200:
     *         description: Success
     */
    this.router.get(`${this.path}`, async (req: Request, res: Response<DataHttpResponse<{ events: Event[] }>>, next: NextFunction) => {
      try {
        const resp = await new Agenda().getEvents(req.headers)
        res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
      } catch (error: unknown) {
        next(error as ControllerException)
      }
    })

    /**
     * @openapi
     * /agenda:
     *   post:
     *     tags:
     *       - Agenda
     *     security:
     *       - bearer: []
     *     summary: Post an event
     *     requestBody:
     *       required: false
     *       content:
     *         application/x-www-form-urlencoded:
     *           schema:
     *             type: object
     *             properties:
     *               fromDate:
     *                 type: string
     *               toDate:
     *                 type: string
     *               title:
     *                 type: string
     *               content:
     *                 type: string
     *               field:
     *                 type: number
     *               category:
     *                 type: string
     *               status:
     *                 type: number
     *     responses:
     *       200:
     *         description: Success
     *       401:
     *         description: Unauthorized
     */
    this.router.post(`${this.path}`, async (req: Request, res: Response<DataHttpResponse<{ events: Event[] }>>, next: NextFunction) => {
      try {
        const resp = await new Agenda().postEvent(req.headers, req.body)
        res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
      } catch (error: unknown) {
        next(error as ControllerException)
      }
    })

    /**
     * @openapi
     * /agenda/{event_id}:
     *   put:
     *     tags:
     *      - Agenda
     *     security:
     *       - bearer: []
     *     summary: Put an event by ID
     *     parameters:
     *       - in: path
     *         name: event_id
     *         required: true
     *     requestBody:
     *       required: false
     *       content:
     *         application/x-www-form-urlencoded:
     *           schema:
     *             type: object
     *             properties:
     *               fromDate:
     *                 type: string
     *               toDate:
     *                 type: string
     *               title:
     *                 type: string
     *               content:
     *                 type: string
     *               field:
     *                 type: number
     *               category:
     *                 type: string
     *               status:
     *                 type: number
     *     responses:
     *       200:
     *         description: Success
     *       401:
     *         description: Unauthorized
     */
    this.router.put(`${this.path}/:id`, async (req: Request, res: Response<DataHttpResponse<{ events: Event[] }>>, next: NextFunction) => {
      try {
        const resp = await new Agenda().putEvent(req.headers, +req.params.id, req.body)
        res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
      } catch (error: unknown) {
        next(error as ControllerException)
      }
    })

    /**
     * @openapi
     * /agenda/{event_id}:
     *   delete:
     *     tags:
     *      - Agenda
     *     security:
     *       - bearer: []
     *     summary: Delete an event by ID
     *     parameters:
     *       - in: path
     *         name: event_id
     *         required: true
     *     responses:
     *       200:
     *         description: Success
     *       401:
     *         description: Unauthorized
     */
    this.router.delete(`${this.path}/:id`, async (req: Request, res: Response<DataHttpResponse<{ events: Event[] }>>, next: NextFunction) => {
      try {
        const resp = await new Agenda().deleteEvent(req.headers, +req.params.id)
        res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
      } catch (error: unknown) {
        next(error as ControllerException)
      }
    })
  }
}
