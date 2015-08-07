/**
 * Created by nathena on 15/1/24.
 */
function test(cb){
    return cb && cb(2);
}

function cb(data){
    return data;
}

console.log(test(cb));

