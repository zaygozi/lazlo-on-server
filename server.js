require('dotenv').config();  //Development environment requirement
const {lazlo} = require('./dbconf');
const express = require('express');
const bodyParser = require('body-parser');
const {restore} = require('./recovery');
const {restoreAll} = require('./recovery');
const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');
const aws = require('aws-sdk');

aws.config.update({
    accessKeyId: process.env.AKI,
    secretAccessKey: process.env.SAK
});

const s3 = new aws.S3();

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
setInterval(function createBackup() {

    fs.readdir('./database', (err, files) => {
        files.forEach(file => {

            let params = {
                Bucket: process.env.BUCKET,
                Body: fs.createReadStream('./database/' + file),
                Key: file
            };

            s3.upload(params, (err, data) => {
                if (err) throw err;
                console.log(`Database backup created at ${data.Location}`);
            });

        });
    });
}, 7200000);

// Routes
server.post('/insert/:docname',(req,res) => {
    
    const isObject = function (a) {
        return (!!a) && (a.constructor === Object);
    };

    let doc = req.params.docname;
    let data = JSON.stringify(req.body);

    lazlo.doc(doc, (err) => {
        if (err) throw res.status(400).send(err);
        console.log(`Accessing document : ${doc}`);
        if(isObject(req.body)) {
            lazlo.insertOne(data, (err, record) => {
                if (err) throw res.status(400).send(err);
                res.send(record);
            });
        }
        else {
            lazlo.insert(data, (err, records) => {
                if (err) throw res.status(400).send(err);
                res.send(records);
            }); 
        }
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

server.get('/:docname/:key/:val', (req,res) => {
    let doc = req.params.docname;
    let key = req.params.key;
    let val = req.params.val;
    lazlo.doc(doc, (err) => {
        if (err) throw res.status(400).send(err);
        console.log(`Accessing document : ${doc}`);
        lazlo.fetch(key, val, 'eq', (err,data) => {
            if (err) throw res.status(400).send(err);
            res.send(data);
        });
    });
});

server.delete('/:docname/:key/:val', (req,res) => {
    let doc = req.params.docname;
    let key = req.params.key;
    let val = req.params.val;
    lazlo.doc(doc, (err) => {
        if (err) throw res.status(400).send(err);
        console.log(`Accessing document : ${doc}`);
        lazlo.remove(key, val, (err,record) => {
            if (err) throw res.status(400).send(err);
            res.send(record);
        });
    });
});

server.patch('/:docname/:key/:val', (req,res) => {
    let doc = req.params.docname;
    let key = req.params.key;
    let val = req.params.val;
    let data = req.body;
    lazlo.doc(doc, (err) => {
        if (err) throw res.status(400).send(err);
        console.log(`Accessing document : ${doc}`);
        for (var par in data) {
            lazlo.update(key, val, par, data[par], (err,record) => {
                if (err) throw res.status(400).send(err);
                res.send(record);        
            });
        }
    });
});

server.listen(port,(err) => {
    if (err) throw err;
    console.log(`Server started on port ${port}`);
});