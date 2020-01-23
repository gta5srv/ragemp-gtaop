global.root = __dirname

import Server from '@lib/core/server'

let server = new Server()

require('./events')(server)
require('./commands')(server)
