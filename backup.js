const aws = require('aws-sdk');
const fs = require('fs');

aws.config.update({
    accessKeyId: process.env.AKI,
    secretAccessKey: process.env.SAK
});

const s3 = new aws.S3();

function backup() {

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
}

module.exports = {backup};

function restore() {

    let listparams = {
        Bucket: process.env.BUCKET
    }

    s3.listObjects(listparams, (err, data) => {
        if (err) throw err;
        let objects = data.Contents;
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
    });
}

module.exports = {restore};