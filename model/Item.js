var mongoose = require('mongoose');
var itemchema = mongoose.Schema({
    name: String,
    image: String,
    type: String,
    saleID: Number,
    purchaseID: Number,
    id: { type: Number, unique: true }
})

// mongoexport -d test -c students -o students.dat 
// mongoimport -d test -c students students.dat 

module.exports = mongoose.model('Item', itemchema);