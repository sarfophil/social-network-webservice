/**
 * 
 */
const assert = require('assert')

describe('Array', function() {
      it('should return -1 when the value is not present', function(){
        assert.equal([1, 2, 3].indexOf(4), -1);
      });
});


describe('Url Pattern',function() {
   it('should return true',function(){
   // /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
     let pattern = /^\/([A-z0-9-_+]+\/)*([A-z0-9]+\.(txt|zip))$/.test('/hello/hello.txt');
     let pattern2 = /\w+\?\w+=\w+\.\w+$/.test('/download?imagename=lore.jpg')
     assert.equal(pattern2,true)
   })

   it('#should return path', function(){
     let str = '/user/admin'
     let strs = str.substring(1)
     let b = strs.split('')
     let x = '';
     for(let i = 0; i < b.length; i++){
       
        if(b[i] == '/') break;

     //   console.log(b[i])

        x += b[i]
     }

      console.log(x)
   })
})