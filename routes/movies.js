const express = require('express')
const router = express.Router()
//const multer = require('multer')
const Movie = require('../models/movie')

const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']

/*
const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype))
    }
})*/


router.get('/', async (req, res) => {
    
    let searchOptions = {}
    let query = Movie.find()
    if (req.query.name != null && req.query.name !== '') {
      query = query.regex('name', new RegExp(req.query.name, 'i'))
    }
    if (req.query.releasedBefore != null && req.query.releasedBefore !== '') {
        query = query.lte('releaseDate', req.query.releasedBefore)
    }
    if (req.query.releasedAfter != null && req.query.releasedAfter !== '') {
        query = query.gte('releaseDate', req.query.releasedAfter)
    }
    try{
        const movies = await query.exec()
        //console.log(movies)
        res.render('movies/index', {
            movies: movies,
            searchOptions: req.query})
        
    } catch{
        res.redirect('/')
    }
    
})


router.get('/new', async (req, res) => {
    renderNewPage(res, new Movie())
})

//Create Movie Route
router.post('/',  async (req, res) => {
    const fileName = req.file != null ? req.file.filename : null
    const movie = new Movie({
        name: req.body.name,
        director: req.body.director,
        releaseDate: new Date(req.body.releaseDate),
        description: req.body.description,
    })
    saveCover(movie, req.body.cover)
    try {
        const newMovie = await movie.save()
        //res.redirect(`movies/${newMovie.id}`)
        res.redirect('movies')

    } catch(err){
        console.log(err)
        renderNewPage(res, movie, true)
    }


})

async function renderNewPage(res, movie, hasError = false) {
    try{
        const params = {
            movie: movie
        }
        if (hasError) params.errorMessage = 'Error Creating Movie'
        res.render('movies/new', params )
    }
    catch{
        res.redirect('/movies')
    }

}

function saveCover(movie, coverEncoded){
    if(coverEncoded == null) return
    const cover = JSON.parse(coverEncoded)
    if (cover != null && imageMimeTypes.includes(cover.type) ){
        movie.coverImage = new Buffer.from(cover.data, 'base64')
        movie.coverImageType = cover.type
    }
}

/*
function removeMovieCover(fileName){
    fs.unlink(path.join(uploadPath, fileName), err => {
        if(err) console.error(err)
    })
}
*/
module.exports = router