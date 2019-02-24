const aws = require('aws-sdk');
const fs = require('fs');

aws.config.update({
    accessKeyId: process.env.AKI,
    secretAccessKey: process.env.SAK
});

const s3 = new aws.S3();

function restore(docname) {

    let params = {
        Bucket: process.env.BUCKET,
        Key: docname
    }

    s3.getObject(params, (err, data) => {
        if (err) throw err;
        fs.writeFile(`${__dirname}/database/${docname}`, data.Body, (err) => {
            if (err) throw err;
            console.log(`Restored document : ${docname}`)
        });
    });
}

module.exports = {restore};

function restoreAll() {
    let listparams = {
        Bucket: process.env.BUCKET
    }

    s3.listObjects(listparams, (err, data) => {
        if (err) throw err;
        let objects = data.Contents;
        if(objects.length != 0) {
            objects.forEach(obj => {

                let params = {
                    Bucket: process.env.BUCKET,
                    Key: obj.Key
                }

                s3.getObject(params, (err, data) => {
                    if (err) throw err;
                    fs.writeFile(`${__dirname}/database/${obj.Key}`, data.Body, (err) => {
                        if (err) throw err;
                        console.log(`Restored document : ${obj.Key}`)
                    });
                });

            });
        }
        else {
            console.log('No backups found on remote server');
        }
    });
}

module.exports = {restoreAll};