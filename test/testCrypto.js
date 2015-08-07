/**
 * Created by nathena on 15/1/24.
 */
var crypto = require("../lib/crypto");

var encode = crypto.aseEncode("哈哈fafasdfasdfasdfafal哈发生的法2313 打发多深 ");
var decode = crypto.aseDecode(encode);

console.log( "  encode : "+encode);
console.log( "  decode : "+decode);