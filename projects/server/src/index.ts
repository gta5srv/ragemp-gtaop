import Loader from '@core/loader'
import Server from '@lib/server'

Loader.run(__dirname)
Server.instance

require('./commands')
