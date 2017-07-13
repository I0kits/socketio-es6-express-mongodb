import fs from 'fs'
import path from 'path'

import logger from './logger'

const util = {
  parsePort: (input) =>{
    const port = parseInt(input, 10)
    return isNaN(port) ? input : port >= 0 ? port : false
  },

  parseServerAddress: (addr) =>{
    return typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port
  },

  parseHttpServerError: (error, port) =>{
    const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port
    switch (error.code) {
      case 'EACCES':
        return bind + ' requires elevated privileges'
      case 'EADDRINUSE':
        return bind + ' is already in use'
      default:
        throw error
    }
  }
};

const loadHttpsCertKeyFiles = ({keyfile, certfile}) =>{
  if(fs.existsSync(keyfile) && fs.existsSync(certfile)) {
    return { key: fs.readFileSync(keyfile), cert: fs.readFileSync(certfile) };
  }
  throw new Error(`Load cert file ${keyfile} or ${certfile}`)
};

const registerEventHandlers = (server, opts) =>{
  server.on('listening', () =>{
    const server_type = opts.https ? 'https' : 'http';
    logger.info('The %s server running on: ', server_type, server.address());
  });

  // server.on('connection', (socket) =>{
  //   socket.unref();
  // });

  server.on('error', (error) =>{
    if (error.syscall !== 'listen') {
      throw error;
    }
    logger.error(util.parseHttpServerError(error, PORT));
  });

  server.on('close', () =>{
    logger.info('The web server be closed.');
  });

  return server;
};

const default_options = {
  https: false, port: util.parsePort(process.env.port || '3000')
};

export default {
  run: (app, opts = {}) =>{
    opts = Object.assign({}, default_options, opts);

    let server;
    if (opts.https) {
      server = require('https').createServer(loadHttpsConfig(opts), app);
    } else {
      server = require('http').createServer(app);
    }

    registerEventHandlers(server, opts).listen(opts.port);

    //add the filter to set socket free
    // app.all('*', (req, res, next) =>{
    //   req.connection.ref();
    //   next();
    //   req.connection.unref();
    // });

    return server;
  }
};
