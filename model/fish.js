var mongoose = require('mongoose');
var fishSchema = mongoose.Schema({
    name: String,
    image: String,
    id: Number,
    option: Object
})

// mongoexport -d test -c students -o students.dat 
// mongoimport -d test -c students students.dat 

module.exports = mongoose.model('Fish', fishSchema);