import { NextFunction, Router } from 'express'
import { Route } from '$models/handle/route.model'
import { Request, Response } from 'express'
import { DefaultHttpResponse } from '$models/responses/http/default-http-response.model'
import { DataHttpResponse } from '$models/responses/http/data-http-response.model'
import Auth from '$controllers/auth.controller'
import { ControllerException } from '$models/types'
import { Team } from '$models/features/team.model'
import Teams from '$controllers/teams.controller'
import { Match } from '$models/features/match.model'

export default class TeamsRouter implements Route {
  router = Router()
  path = '/teams'

  constructor() {
    this.init()
  }

  private init() {
    /**
     * @openapi
     * /teams:
     *   get:
     *     tags:
     *       - Teams
     *     summary: Get the teams
     *     responses:
     *       200:
     *         description: Success
     */
    this.router.get(`${this.path}`, async (req: Request, res: Response<DataHttpResponse<{ teams: Team[] }>>, next: NextFunction) => {
      try {
        const resp = await new Teams().getTeams()
        res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
      } catch (error: unknown) {
        next(error as ControllerException)
      }
    })

    /**
     * @openapi
     * /teams:
     *   post:
     *     tags:
     *       - Teams
     *     security:
     *       - bearer: []
     *     summary: Post a team
     *     requestBody:
     *       required: false
     *       content:
     *         application/x-www-form-urlencoded:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *               school:
     *                 type: number
     *               teammates:
     *                 type: string
     *     responses:
     *       200:
     *         description: Success
     *       401:
     *         description: Unauthorized
     */
    this.router.post(`${this.path}`, async (req: Request, res: Response<DataHttpResponse<{ teams: Team[] }>>, next: NextFunction) => {
      try {
        const resp = await new Teams().postTeam(req.headers, req.body)
        res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
      } catch (error: unknown) {
        next(error as ControllerException)
      }
    })

    /**
     * @openapi
     * /teams/{team_id}:
     *   put:
     *     tags:
     *      - Teams
     *     security:
     *       - bearer: []
     *     summary: Put a team by ID
     *     parameters:
     *       - in: path
     *         name: team_id
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
     *               school:
     *                 type: number
     *               teammates:
     *                 type: string
     *     responses:
     *       200:
     *         description: Success
     *       401:
     *         description: Unauthorized
     */
    this.router.put(`${this.path}/:id`, async (req: Request, res: Response<DataHttpResponse<{ teams: Team[] }>>, next: NextFunction) => {
      try {
        const resp = await new Teams().putTeam(req.headers, +req.params.id, req.body)
        res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
      } catch (error: unknown) {
        next(error as ControllerException)
      }
    })

    /**
     * @openapi
     * /teams/{team_id}:
     *   delete:
     *     tags:
     *      - Teams
     *     security:
     *       - bearer: []
     *     summary: Delete a team by ID
     *     parameters:
     *       - in: path
     *         name: team_id
     *         required: true
     *     responses:
     *       200:
     *         description: Success
     *       401:
     *         description: Unauthorized
     */
    this.router.delete(
      `${this.path}/:id`,
      async (req: Request, res: Response<DataHttpResponse<{ teams: Team[]; matches: Match[] }>>, next: NextFunction) => {
        try {
          const resp = await new Teams().deleteTeam(req.headers, +req.params.id)
          res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
        } catch (error: unknown) {
          next(error as ControllerException)
        }
      }
    )
  }
}
