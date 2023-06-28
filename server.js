const express = require('express');
const mongoose = require('mongoose');
const ShortUrl = require('./models/shortUrl');
const app = express();

// mongoose.connect('mongodb+srv://lalit9171:lalit9025@cluster0.enuowoj.mongodb.net/?retryWrites=true&w=majority', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// });


mongoose.connect('mongodb+srv://Ashish:Ashish%40123@cluster0.bkoq9fg.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex:true,
    // useFindAndModify:false
});

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));

// Search route
app.get('/', async (req, res) => {
    const searchText = req.query.q; // Get the search query from the request
    let shortUrls;
    let errorMessage = '';

    if (searchText) {
        shortUrls = await ShortUrl.find({
            $or: [
                { full: { $regex: searchText, $options: 'i' } }, // Case-insensitive search in the full URL
                { short: { $regex: searchText, $options: 'i' } }, // Case-insensitive search in the short URL
                { note: { $regex: searchText, $options: 'i' } }, // Case-insensitive search in the note
            ],
        }).exec();
    } else {
        shortUrls = await ShortUrl.find().exec(); // Fetch all short URLs if no search query provided
    }

    res.render('index', { shortUrls, errorMessage });
});

// URL Shrink route
app.post('/shortUrls', async (req, res) => {
    const { fullUrl, note } = req.body;
    const existingShortUrl = await ShortUrl.findOne({ full: fullUrl });

    if (existingShortUrl) {
        let errorMessage = 'URL already exists.';
        const shortUrls = await ShortUrl.find().exec();
        res.render('index', { shortUrls, errorMessage });
    } else {
        if(note){
        const existingNote = await ShortUrl.findOne({ note: note });

        if (existingNote) {
            let errorMessage = 'Note already exists.';
            const shortUrls = await ShortUrl.find().exec();
            res.render('index', { shortUrls, errorMessage });
        } else {
            await ShortUrl.create({ full: fullUrl, note });
            res.redirect('/');
        }
     }else
    {
        await ShortUrl.create({ full: fullUrl });
        res.redirect('/');
    }

    }
});

// Redirect route
app.get('/:shortUrl', async (req, res) => {
    const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl });
    if (!shortUrl) return res.sendStatus(404);
    shortUrl.clicks++;
    shortUrl.save();
    res.redirect(shortUrl.full);
});

app.listen(process.env.PORT || 5000);
