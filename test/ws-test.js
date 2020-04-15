/***
 * Websocket Integration testing*/
const ws = require('../util/ws-events');

describe('#Ws Testing',()=> {
    it('#should return error',()=> {
        ws(['philsarfogh@gmail.com'],{});
    })
})