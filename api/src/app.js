import path from 'path'
import morgan from 'morgan'
import express from 'express'
import favicon from 'serve-favicon'
import compression from 'compression'
import graceful from 'express-graceful-exit'

import socketio from 'socket.io';
import redis from 'socket.io-redis';

import config from './config'
import logger from './utils/logger'
import webserver from './utils/webserver'

const app = express()
const server = webserver.run(app)

if(!config.gzipOff){
  app.use(compression())
}

app.use(morgan('combined'))
app.use(graceful.middleware(app))
app.use(express.static(path.join(__dirname, '../www')))
app.use(favicon(path.join(__dirname, '../www', 'public', 'favicon.ico')))

const io = socketio(server, {path: '/room'})
io.on('connection', (socket) => {
  logger.info('have a user connection..')

  socket.on('disconnect', () => {
    logger.info('user disconnect')
  })

  socket.on('send_message', (data)=> {
    logger.info('get data:', data)
  })
})



process.on('beforeExit', ()=> {
  logger.info('the server will be close.')
  graceful.gracefulExitHandler(app, server, {})
});
