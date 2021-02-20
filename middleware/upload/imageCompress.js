const sharp = require('sharp')

const compressImage = async function (buffer){
    let resized
    await sharp(buffer).resize(320, 240).toBuffer()
        .then( data => { 
            resized = data
        })
        .catch( err => {
            console.log(err)
            resized = null
        })

    return resized
}

module.exports = compressImage