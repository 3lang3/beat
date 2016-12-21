var mongoose = require('mongoose');
var fishSchema = mongoose.Schema({
    title: String,
    img: String,
    option: Object
})

// mongoexport -d test -c students -o students.dat 
// mongoimport -d test -c students students.dat 

module.exports = mongoose.model('Fish', fishSchema);