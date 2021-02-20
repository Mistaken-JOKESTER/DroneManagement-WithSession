const sanitizeHtml=require('sanitize-html')

//sanitize the give value
const sanitize = (value) => {
    return sanitizeHtml(value, {
        //allowed tags
        allowedTags: [],
        //allowed attributes
        allowedAttributes: {}
    })
}

module.exports = sanitize