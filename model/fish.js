var mongoose = require('mongoose');
var fishSchema = mongoose.Schema({
    title: String,
    img: String,
    option: Object
})

module.exports = mongoose.model('Fish', fishSchema);