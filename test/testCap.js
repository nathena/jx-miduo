/**
 * Created by nathena on 15/1/23.
 */

function testCap(){

    return (function(){

        var charPool = ('abcdefghijklmnopqrstuvwxyz' + 'abcdefghijklmnopqrstuvwxyz'.toUpperCase() + '1234567890').split('');
        var len = charPool.length;
        //console.log( charPool );
        return ""+random()+random()+random()+random();

        function random(){

            var index = Math.ceil(len*Math.random(len));
            return charPool[index];
        }
    })();

}

console.log( testCap() );
console.log( testCap() );
console.log( testCap() );
console.log( testCap() );