import { Server, Socket } from 'socket.io'
import { DefaultEventsMap } from 'socket.io/dist/typed-events'
import db from '$utils/database'
import { IO } from '$models/handle/io.model'
import { count } from '$models/types'
import nexter from '$utils/nexter'
import { AuthService } from '$services/auth.service'

export default class DefaultSocket implements IO {

  static scoreboard: Scoreboard = {
    t1: 'EQ1',
    t2: 'EQ2',
    s1: '0',
    s2: '0',
    play: false,
    t: '0',
    add: '0'
  }

  socket(socket: Socket, io: Server) {
    socket.on('updateScoreboard', async (data) => {
      try {
        nexter.serviceToException(await new AuthService().checkAuth('Bearer ' + data.jwt, 'Bearer'))
      } catch (error) {
        return
      }

      DefaultSocket.scoreboard = data.scoreboard
      io.emit('scoreboardUpdated', data.scoreboard)
    })

    socket.on('getScoreboard', async () => {
      io.emit('scoreboardUpdated', DefaultSocket.scoreboard)
    })
  }
}

interface Scoreboard {
  t1: string
  t2: string
  s1: string
  s2: string
  play: boolean
  t: string
  add: string
}