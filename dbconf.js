const lazlo = require('lazlo-node');

lazlo.connect(__dirname,'database',(err) => {
    if (err) throw err;
    console.log('Established Database Connection !');
})

module.exports = {lazlo}