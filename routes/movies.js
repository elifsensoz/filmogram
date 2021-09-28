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

router.get('/:id', async (req, res) => {
    try{
        const movie = await Movie.findById(req.params.id)
        res.render('movies/show', {movie: movie})

    }catch{
        res.redirect('/')

    }
})

router.get('/:id/edit', async (req, res) => {
    try{
        const movie = await Movie.findById(req.params.id)
        renderEditPage(res, movie)

    }catch{
        res.redirect('movies')
    }  
})

//Update
router.put('/:id', async (req, res) => {
    let movie
    try {
        movie = await Movie.findById(req.params.id)
        movie.name = req.body.name
        movie.director = req.body.director
        movie.releaseDate = new Date(req.body.releaseDate)
        movie.description = req.body.description
        if(req.body.cover != null && req.body.cover !== ''){
            saveCover(movie, req.body.cover)
        }
        await movie.save()
        res.redirect(`/movies/${movie.id}`)
        //res.redirect('movies')

    } catch(err){
        console.log(err)
        if(movie == null){
            res.redirect('/')
        }
        else {
            renderEditPage(res, movie, true)
            }
        }
})
//Delete Movie
router.delete('/:id', async(req, res) => {
    let movie
    try{
        movie = await Movie.findById(req.params.id)
        await movie.remove()
        res.redirect('/movies')

    }catch{
        if(movie!= null){
            res.render('movies/show', {
                movie: movie,
                errorMessage: 'Could not remove movie'
            })    
        }
        else{
            res.redirect('/')
        }

    }
})

//Create Movie Route
router.post('/',  async (req, res) => {

    const movie = new Movie({
        name: req.body.name,
        director: req.body.director,
        releaseDate: new Date(req.body.releaseDate),
        description: req.body.description,
    })
    saveCover(movie, req.body.cover)
    try {
        const newMovie = await movie.save()
        res.redirect(`movies/${newMovie.id}`)
        //res.redirect('movies')

    } catch(err){
        console.log(err)
        renderNewPage(res, movie, true)
    }


})

async function renderNewPage(res, movie, hasError = false) {
    renderFormPage(res, movie, 'new', hasError)
}

async function renderEditPage(res, movie, hasError = false) {
    renderFormPage(res, movie, 'edit', hasError)
}

async function renderFormPage(res, movie, form, hasError = false) {
    try{
        const params = {
            movie: movie
        }
        if (hasError){
            if (form == 'edit') params.errorMessage = 'Error Updating Movie'
            else if (form == 'new ') params.errorMessage = 'Error Creating Movie'
        } 
        res.render(`movies/${form}`, params )
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