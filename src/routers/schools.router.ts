import { NextFunction, Router } from 'express'
import { Route } from '$models/handle/route.model'
import { Request, Response } from 'express'
import { DefaultHttpResponse } from '$models/responses/http/default-http-response.model'
import { DataHttpResponse } from '$models/responses/http/data-http-response.model'
import Auth from '$controllers/auth.controller'
import { ControllerException } from '$models/types'
import { School } from '$models/features/school.model'
import Schools from '$controllers/schools.controller'

export default class SchoolsRouter implements Route {
  router = Router()
  path = '/schools'

  constructor() {
    this.init()
  }

  private init() {
    /**
     * @openapi
     * /schools:
     *   get:
     *     tags:
     *       - Schools
     *     summary: Get the schools
     *     responses:
     *       200:
     *         description: Success
     */
    this.router.get(`${this.path}`, async (req: Request, res: Response<DataHttpResponse<{ schools: School[] }>>, next: NextFunction) => {
      try {
        const resp = await new Schools().getSchools()
        res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
      } catch (error: unknown) {
        next(error as ControllerException)
      }
    })

    /**
     * @openapi
     * /schools:
     *   post:
     *     tags:
     *       - Schools
     *     security:
     *       - bearer: []
     *     summary: Post a school
     *     requestBody:
     *       required: false
     *       content:
     *         application/x-www-form-urlencoded:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *               category:
     *                 type: number
     *     responses:
     *       200:
     *         description: Success
     *       401:
     *         description: Unauthorized
     */
    this.router.post(`${this.path}`, async (req: Request, res: Response<DataHttpResponse<{ schools: School[] }>>, next: NextFunction) => {
      try {
        const resp = await new Schools().postSchool(req.headers, req.body)
        res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
      } catch (error: unknown) {
        next(error as ControllerException)
      }
    })

    /**
     * @openapi
     * /schools/{school_id}:
     *   put:
     *     tags:
     *      - Schools
     *     security:
     *       - bearer: []
     *     summary: Put a school by ID
     *     parameters:
     *       - in: path
     *         name: school_id
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
     *               category:
     *                 type: string
     *     responses:
     *       200:
     *         description: Success
     *       401:
     *         description: Unauthorized
     */
    this.router.put(`${this.path}/:id`, async (req: Request, res: Response<DataHttpResponse<{ schools: School[] }>>, next: NextFunction) => {
      try {
        const resp = await new Schools().putSchool(req.headers, +req.params.id, req.body)
        res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
      } catch (error: unknown) {
        next(error as ControllerException)
      }
    })

    /**
     * @openapi
     * /schools/{school_id}:
     *   delete:
     *     tags:
     *      - Schools
     *     security:
     *       - bearer: []
     *     summary: Delete a school by ID
     *     parameters:
     *       - in: path
     *         name: school_id
     *         required: true
     *     responses:
     *       200:
     *         description: Success
     *       401:
     *         description: Unauthorized
     */
    this.router.delete(`${this.path}/:id`, async (req: Request, res: Response<DataHttpResponse<{ schools: School[] }>>, next: NextFunction) => {
      try {
        const resp = await new Schools().deleteSchool(req.headers, +req.params.id)
        res.status(resp.httpStatus).send({ code: resp.code, message: resp.message, data: resp.data })
      } catch (error: unknown) {
        next(error as ControllerException)
      }
    })
  }
}
