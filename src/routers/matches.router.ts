import { NextFunction, Router } from 'express'
import { Route } from '$models/handle/route.model'
import { Request, Response } from 'express'
import { DefaultHttpResponse } from '$models/responses/http/default-http-response.model'
import { DataHttpResponse } from '$models/responses/http/data-http-response.model'
import Auth from '$controllers/auth.controller'
import { ControllerException } from '$models/types'
import { Match } from '$models/features/match.model'
import Matches from '$controllers/matches.controller'

export default class MatchesRouter implements Route {
  router = Router()
  path = '/matches'

  constructor() {
    this.init()
  }

  
  private init() {
    /**
     * @openapi
     * /matches:
     *   get:
     *     tags:
     *       - Matches
     *     summary: Get the matches
     *     responses:
     *       200:
     *         description: Success
     */
    this.router.get(`${this.path}`, async (req: Request, res: Response<DataHttpResponse<{ matches: Match[] }>>, next: NextFunction) => {
      try {
        const resp = await new Matches().getMatches()
        res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
      } catch (error: unknown) {
        next(error as ControllerException)
      }
    })

    /**
     * @openapi
     * /matches:
     *   post:
     *     tags:
     *       - Matches
     *     security:
     *       - bearer: []
     *     summary: Post a match
     *     requestBody:
     *       required: false
     *       content:
     *         application/x-www-form-urlencoded:
     *           schema:
     *             type: object
     *             properties:
     *               team1:
     *                 type: number
     *               team2:
     *                 type: number
     *               score1:
     *                 type: number
     *               score2:
     *                 type: number
     *               category:
     *                 type: string
     *               fromDate:
     *                 type: string
     *               toDate:
     *                 type: string
     *               field:
     *                 type: number
     *               tree:
     *                 type: number
     *     responses:
     *       200:
     *         description: Success
     *       401:
     *         description: Unauthorized
     */
    this.router.post(`${this.path}`, async (req: Request, res: Response<DataHttpResponse<{ matches: Match[] }>>, next: NextFunction) => {
      try {
        const resp = await new Matches().postMatch(req.headers, req.body)
        res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
      } catch (error: unknown) {
        next(error as ControllerException)
      }
    })

    /**
     * @openapi
     * /matches/{match_id}:
     *   put:
     *     tags:
     *      - Matches
     *     security:
     *       - bearer: []
     *     summary: Put a match by ID
     *     parameters:
     *       - in: path
     *         name: match_id
     *         required: true
     *     requestBody:
     *       required: false
     *       content:
     *         application/x-www-form-urlencoded:
     *           schema:
     *             type: object
     *             properties:
     *               team1:
     *                 type: number
     *               team2:
     *                 type: number
     *               score1:
     *                 type: number
     *               score2:
     *                 type: number
     *               category:
     *                 type: string
     *               fromDate:
     *                 type: string
     *               toDate:
     *                 type: string
     *               field:
     *                 type: number
     *               tree:
     *                 type: number
     *     responses:
     *       200:
     *         description: Success
     *       401:
     *         description: Unauthorized
     */
    this.router.put(`${this.path}/:id`, async (req: Request, res: Response<DataHttpResponse<{ matches: Match[] }>>, next: NextFunction) => {
      try {
        const resp = await new Matches().putMatch(req.headers, +req.params.id, req.body)
        res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
      } catch (error: unknown) {
        next(error as ControllerException)
      }
    })

    /**
     * @openapi
     * /matches/{match_id}:
     *   delete:
     *     tags:
     *      - Matches
     *     security:
     *       - bearer: []
     *     summary: Delete a match by ID
     *     parameters:
     *       - in: path
     *         name: match_id
     *         required: true
     *     responses:
     *       200:
     *         description: Success
     *       401:
     *         description: Unauthorized
     */
    this.router.delete(
      `${this.path}/:id`,
      async (req: Request, res: Response<DataHttpResponse<{ matches: Match[] }>>, next: NextFunction) => {
        try {
          const resp = await new Matches().deleteMatch(req.headers, +req.params.id)
          res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
        } catch (error: unknown) {
          next(error as ControllerException)
        }
      }
    )
  }
}
