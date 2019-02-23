const {lazlo} = require('./dbconf');
const express = require('express');
const bodyParser = require('body-parser');

const server = express();

let port = process.env.PORT || 3000;

server.use(bodyParser.json({type : "*/*"}));

server.post('/insert/:docname',(req,res) => {
    let data = JSON.stringify(req.body);
    let doc = req.params.docname;
    lazlo.doc(doc, (err) => {
        if (err) res.status(400).send(err);
        console.log(`Accessing document : ${doc}`);
        lazlo.insertOne(data, (err,record) => {
            if (err) res.status(400).send(err);
            res.status(200).send(record);
        });
    });
});

server.post('/batch-insert/:docname', (req, res) => {
    let data = JSON.stringify(req.body);
    let doc = req.params.docname;
    lazlo.doc(doc, (err) => {
        if (err) res.status(400).send(err);
        console.log(`Accessing document : ${doc}`);
        lazlo.insert(data, (err, records) => {
            if (err) res.status(400).send(err);
            res.status(200).send(records);
        });
    });
});

server.get('/:docname', (req,res) => {
    let doc = req.params.docname;
    lazlo.doc(doc, (err) => {
        if (err) res.status(400).send(err);
        console.log(`Accessing document : ${doc}`);
        lazlo.fetchAll((err,data) => {
            if (err) res.status(400).send(err);
            res.status(200).send(data);
        });
    });
});

server.get('/:docname/:roll', (req,res) => {
    let doc = req.params.docname;
    let roll = req.params.roll;
    lazlo.doc(doc, (err) => {
        if (err) res.status(400).send(err);
        console.log(`Accessing document : ${doc}`);
        lazlo.fetch('roll', roll, 'eq', (err,data) => {
            if (err) res.status(400).send(err);
            res.status(200).send(data);
        });
    });
});

server.delete('/:docname/:roll', (req,res) => {
    let doc = req.params.docname;
    let roll = parseInt(req.params.roll);
    lazlo.doc(doc, (err) => {
        if (err) res.status(400).send(err);
        console.log(`Accessing document : ${doc}`);
        lazlo.remove('roll', roll, (err,record) => {
            if (err) res.status(400).send(err);
            res.status(200).send(record);
        });
    });
});

server.listen(port,(err) => {
    if (err) throw err;
    console.log(`Server started on port ${port}`);
});