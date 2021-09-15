const express = require('express')
const router = express.Router()
const Movie = require ('../models/movie')


router.get('/', async (req, res) => {
    let movies
    try{
        movies = await Movie.find().sort({createDate: 'desc'}).limit(3).exec()
        console.log(movies)

    }
    catch{
        movies = []

    }
    res.render('index', {movies: movies})
})

module.exports = router