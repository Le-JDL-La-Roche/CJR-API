import multer from 'multer'
import nexter from '../utils/nexter'
import { DefaultHttpResponse } from '$models/responses/http/default-http-response.model'
import { AUTH_ERROR } from '$models/types'
import { AuthService } from '$services/auth.service'
import { NextFunction } from 'express'
import { Request, Response } from 'express'
import { UnauthorizedException } from '$responses/exceptions/unauthorized-exception.response'

export class FilesService {
  private async uploadFile(req: Request, res: Response, next: NextFunction, prefix: string) {
    const webradio = multer.diskStorage({
      destination: (req, file, next) => {
        next(null, './public/images/')
      },
      filename: (req, file, next) => {
        const uniqueSuffix = Date.now().toString(16)
        const fileExtension = file.originalname.split('.').pop()
        next(null, `${prefix}-${uniqueSuffix}.${fileExtension}`)
      }
    })

    const upload = multer({ storage: webradio }).single('file')
    
    try {
      nexter.serviceToException(await new AuthService().checkAuth(req.headers['authorization'] + '', 'Bearer'))
    } catch (error) {
      res.status(401).json({ code: AUTH_ERROR, message: 'Unauthorized' })
      return
    }

    upload(req, res, async (err: any) => {
      if (err instanceof multer.MulterError) {
        console.error(1, err)
      } else if (err) {
        console.error(2, err)
      }
      next()
    })
  }
}
