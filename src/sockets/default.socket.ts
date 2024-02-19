import { Server, Socket } from 'socket.io'
import { DefaultEventsMap } from 'socket.io/dist/typed-events'
import db from '$utils/database'
import { IO } from '$models/handle/io.model'
import { count } from '$models/types'

export default class DefaultSocket implements IO {

  socket(socket: Socket, io: Server) {}
}
