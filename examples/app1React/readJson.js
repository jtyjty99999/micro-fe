var fs = require('fs');
var filestr = JSON.parse(fs.readFileSync('./project.json'));
Object.keys(filestr).forEach(e=> {
    console.log(`${e}=${filestr[e]}`)
})
