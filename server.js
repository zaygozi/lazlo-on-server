require('dotenv').config();  //Development environment requirement
const {lazlo} = require('./dbconf');
const express = require('express');
const bodyParser = require('body-parser');
const {backup} = require('./backup');
const {restore} = require('./backup');
const {restoreAll} = require('./backup');
const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');

const server = express();

let port = process.env.PORT || 3000;

server.use(bodyParser.json({type : "*/*"}));

// Restore if database is erased
fs.readdir('./database', (err,files) => {
    if (err) throw err;
    if(files.length === 0) {
        restoreAll();
    }
});

// Restore particular documents
let watcher = chokidar.watch('./database', {persistent : true});
watcher.on('unlink', (filePath) => {
    let docname = path.basename(filePath);
    restore(docname);
}); 

//Backup files every 2 hrs
setInterval(function () { backup() }, 7200000);

// Routes
server.post('/insert/:docname',(req,res) => {
    let data = JSON.stringify(req.body);
    let doc = req.params.docname;
    lazlo.doc(doc, (err) => {
        if (err) throw res.status(400).send(err);
        console.log(`Accessing document : ${doc}`);
        lazlo.insertOne(data, (err,record) => {
            if (err) throw res.status(400).send(err);
            res.send(record);
        });
    });
});

server.post('/batch-insert/:docname', (req, res) => {
    let data = JSON.stringify(req.body);
    let doc = req.params.docname;
    lazlo.doc(doc, (err) => {
        if (err) throw res.status(400).send(err);
        console.log(`Accessing document : ${doc}`);
        lazlo.insert(data, (err, records) => {
            if (err) throw res.status(400).send(err);
            res.send(records);
        });
    });
});

server.get('/:docname', (req,res) => {
    let doc = req.params.docname;
    lazlo.doc(doc, (err) => {
        if (err) throw res.status(400).send(err);
        console.log(`Accessing document : ${doc}`);
        lazlo.fetchAll((err,data) => {
            if (err) throw res.status(400).send(err);
            res.send(data);
        });
    });
});

server.get('/:docname/:roll', (req,res) => {
    let doc = req.params.docname;
    let roll = req.params.roll;
    lazlo.doc(doc, (err) => {
        if (err) throw res.status(400).send(err);
        console.log(`Accessing document : ${doc}`);
        lazlo.fetch('roll', roll, 'eq', (err,data) => {
            if (err) throw res.status(400).send(err);
            res.send(data);
        });
    });
});

server.delete('/:docname/:roll', (req,res) => {
    let doc = req.params.docname;
    let roll = parseInt(req.params.roll);
    lazlo.doc(doc, (err) => {
        if (err) throw res.status(400).send(err);
        console.log(`Accessing document : ${doc}`);
        lazlo.remove('roll', roll, (err,record) => {
            if (err) throw res.status(400).send(err);
            res.send(record);
        });
    });
});

server.listen(port,(err) => {
    if (err) throw err;
    console.log(`Server started on port ${port}`);
});