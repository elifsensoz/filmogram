const mongoose = require('mongoose')

const movieSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    description:{
        type: String
    },
    releaseDate:{
        type:Date,
        required: true
    },
    createDate:{
        type:Date,
        required: true,
        default: Date.now
    },
    coverImage:{
        type: Buffer,
        required:true
    },
    coverImageType:{
        type:String,
        require:true
    },
    director: {
        type: String,
        required: true
    }
})

movieSchema.virtual('coverImagePath').get(function() {
    if(this.coverImage != null && this.coverImageType != null){
        return `data: ${this.coverImageType}; charset=utf-8;base64, ${this.coverImage.toString('base64')}`

    }
})

module.exports = mongoose.model('Movie', movieSchema)
