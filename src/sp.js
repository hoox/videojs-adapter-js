var youbora = require('youboralib')
require('./adapter')
require('./register-plugin')(youbora)

module.exports = youbora
