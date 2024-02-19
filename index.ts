import App from './src/app'
import DefaultRouter from '$routers/default.router'
import AuthRouter from '$routers/auth.router'
import DefaultSocket from '$sockets/default.socket'
import AgendaRouter from '$routers/agenda.router'
import SchoolsRouter from '$routers/schools.router'
import TeamsRouter from '$routers/teams.router'
import MatchesRouter from '$routers/matches.router'
import LivesRouter from '$routers/lives.router'

new App(
  [new DefaultRouter(), new AuthRouter(), new SchoolsRouter(), new TeamsRouter(), new MatchesRouter(), new AgendaRouter(), new LivesRouter()],
  [new DefaultSocket()]
).listen()
