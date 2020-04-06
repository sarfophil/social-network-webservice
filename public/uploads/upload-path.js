/** File returns absolute path of uploads */
const path = require('path')
module.exports = {
    getPath: () => path.join(__dirname)
}