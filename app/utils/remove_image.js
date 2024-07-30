const { unlink } = require("node:fs");


const removeImage = (path) => {
    if (path) unlink(path, (err => { if (err) return }));
    else return;
}

module.exports = removeImage;
