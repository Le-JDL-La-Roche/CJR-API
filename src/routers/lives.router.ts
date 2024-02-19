import { NextFunction, Router } from 'express'
import { Route } from '$models/handle/route.model'
import { Request, Response } from 'express'
import { DataHttpResponse } from '$models/responses/http/data-http-response.model'
import { ControllerException } from '$models/types'
import { Live } from '$models/features/live.model'
import Lives from '$controllers/lives.controller'
import { Team } from '$models/features/team.model'
import { Match } from '$models/features/match.model'

export default class LivesRouter implements Route {
  router = Router()
  path = '/lives'

  constructor() {
    this.init()
  }

  private init() {
    /**
     * @openapi
     * /lives:
     *   get:
     *     tags:
     *       - Lives
     *     summary: Get the lives
     *     responses:
     *       200:
     *         description: Success
     */
    this.router.get(`${this.path}`, async (req: Request, res: Response<DataHttpResponse<{ lives: Live[] }>>, next: NextFunction) => {
      try {
        const resp = await new Lives().getLives(req.headers)
        res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
      } catch (error: unknown) {
        next(error as ControllerException)
      }
    })

    /**
     * @openapi
     * /lives:
     *   post:
     *     tags:
     *       - Lives
     *     security:
     *       - bearer: []
     *     summary: Post a live
     *     requestBody:
     *       required: false
     *       content:
     *         application/x-www-form-urlencoded:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *               date:
     *                 type: string
     *               status:
     *                 type: string
     *               url:
     *                 type: string
     *     responses:
     *       200:
     *         description: Success
     *       401:
     *         description: Unauthorized
     */
    this.router.post(`${this.path}`, async (req: Request, res: Response<DataHttpResponse<{ lives: Live[] }>>, next: NextFunction) => {
      try {
        const resp = await new Lives().postLive(req.headers, req.body)
        res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
      } catch (error: unknown) {
        next(error as ControllerException)
      }
    })

    /**
     * @openapi
     * /lives/{live_id}:
     *   put:
     *     tags:
     *      - Lives
     *     security:
     *       - bearer: []
     *     summary: Put a live by ID
     *     parameters:
     *       - in: path
     *         name: live_id
     *         required: true
     *     requestBody:
     *       required: false
     *       content:
     *         application/x-www-form-urlencoded:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *               date:
     *                 type: string
     *               status:
     *                 type: string
     *               url:
     *                 type: string
     *     responses:
     *       200:
     *         description: Success
     *       401:
     *         description: Unauthorized
     */
    this.router.put(`${this.path}/:id`, async (req: Request, res: Response<DataHttpResponse<{ lives: Live[] }>>, next: NextFunction) => {
      try {
        const resp = await new Lives().putLive(req.headers, +req.params.id, req.body)
        res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
      } catch (error: unknown) {
        next(error as ControllerException)
      }
    })

    /**
     * @openapi
     * /lives/{live_id}:
     *   delete:
     *     tags:
     *      - Lives
     *     security:
     *       - bearer: []
     *     summary: Delete a live by ID
     *     parameters:
     *       - in: path
     *         name: live_id
     *         required: true
     *     responses:
     *       200:
     *         description: Success
     *       401:
     *         description: Unauthorized
     */
    this.router.delete(
      `${this.path}/:id`,
      async (req: Request, res: Response<DataHttpResponse<{ lives: Live[] }>>, next: NextFunction) => {
        try {
          const resp = await new Lives().deleteLive(req.headers, +req.params.id)
          res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
        } catch (error: unknown) {
          next(error as ControllerException)
        }
      }
    )
  }
}
