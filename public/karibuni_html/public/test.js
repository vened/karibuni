//var array = [1, 2, 35, 7, 9, 54];
//
//
//var newArray;
//newArray = array.filter(function (x) {
//    if (x < 10) {
//        return x;
//    }
//});
// Напишите функцию, которая из произвольного входящего массива выберет все комбинации чисел, сумма которых будет равняться 10.


var data = [1, 2, 7, 9, 3, 8];
var results = [];

sum()


function sum() {
    console.log(data);
    var startItem = data.shift();
    var result = [startItem];
    for (var i = 0; i < data.length; i++) {
        result.push(data[i]);
        var sumEl = sumElements(result);
        console.log(result, sumEl);


        if(sumEl == 10){
            results.push(result);
            result = [startItem];
        }

        if( sumEl > 10){
            result = [startItem];
//            result.push(data[i])
//            console.log(result)
        }

    }
    console.log("sum end----------------------------");

    if (data.length >= 3)
        sum();

};

console.log("results ----------------------------------");
console.log(results);


function sumElements(a) {
    return a.reduce(function (x, y) {
        return x + y
    })
}
