const redirectDahboard = function (req, res, next){
    try{
        if(req.session.userId){
            return res.redirect('/developer/home/dashboard')
        }

        next()
    } catch(e) {
        console.log(e)
        res.render('pages/505Error')
    }
}

const redirectHome = function (req, res, next){
    try{
        if(!req.session.userId){
            return res.redirect('/developer/home/')
        }

        next()
    } catch(e) {
        console.log(e)
        res.render('pages/505Error')
    }
}
const otpredirect = function (req, res, next){
    try{
        if(!req.session.loginId){
            if(req.session.userId)
                return res.redirect('/developer/home/dashboard')
            else
                return res.redirect('/developer/home/')
        }

        next()
    } catch(e) {
        console.log(e)
        res.render('pages/505Error')
    }
}

module.exports = {
    redirectDahboard,
    redirectHome,
    otpredirect
}