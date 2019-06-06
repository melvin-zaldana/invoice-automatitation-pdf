const express = require('express');
const path = require('path');


// Initialization
const app = express();

// Settings
app.set('port', process.env.PORT || 3000 );
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


// Middleware
app.use(express.urlencoded({extended: false}));

// Global variables


// Routes
app.use(require('./routes/index'));

// Static file
app.use(express.static(path.join(__dirname, 'public')));

// Start the server
const server = app.listen(app.get('port'), () =>{
    console.log(`Server on port  3000`);
})

