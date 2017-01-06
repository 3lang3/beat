var mongoose = require('mongoose');
var gemCourierSchema = mongoose.Schema({
    image: String,
    name: String,
    type: String,
    price: String,
    id: Number
})

// mongoexport -d test -c students -o students.dat 
// mongoimport -d test -c students students.dat 

module.exports = mongoose.model('GemCourier', gemCourierSchema);