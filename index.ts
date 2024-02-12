import App from './src/app'
import DefaultRouter from '$routers/default.router'
import AuthRouter from '$routers/auth.router'
import DefaultSocket from '$sockets/default.socket'
import AgendaRouter from '$routers/agenda.router'
import SchoolsRouter from '$routers/schools.router'
import TeamsRouter from '$routers/teams.router'

new App([new DefaultRouter(), new AuthRouter(), new SchoolsRouter(), new TeamsRouter(), new AgendaRouter()], [new DefaultSocket()]).listen()
