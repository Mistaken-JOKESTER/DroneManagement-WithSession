const router = require('express').Router()
const DroneModal = require('../../modals/DroneModal')
const TEMPDroneModal = require('../../modals/TemporaryModalContainer')
const droneModalDataValidation = require('../../middleware/droneModal/droneModalDataValidation')
const { redirectHome } = require('../../middleware/developer/developerAuth')
const { uploadFirm } = require('../../middleware/upload/keyLogFirmUpload')
const imageAndFirmwareUpload = require('../../middleware/upload/imageAndFirmwareUpload')
const compressImage = require('../../middleware/upload/imageCompress')

//to be constructed
router.get('/', redirectHome, async (req, res) => {
    try{
        const modals = await DroneModal.find({}, {_id:1, modalName:1, modalNumber:1, inAir:1})

        //cheching ig any message present form previous redirect
        const success_msg = req.flash('success_msg')[0]
        const error_msg = req.flash('error_msg')[0]
        const warning_msg = req.flash('warning_msg')[0]
        res.render('pages/droneModal/modals', {
            modals,
            success_msg,
            error_msg,
            warning_msg
        })
    } catch(e) {
        console.log(e)
        res.render('pages/505Error')
    }
})

router.get('/newModal', redirectHome, (req, res) => {
    try{
        res.render('pages/droneModal/newModal')
    } catch(e) {
        console.log(e)
        res.render('pages/505Error')
    }
})

router.post('/newModal', redirectHome, droneModalDataValidation, async (req, res) => {
    try{
        const tempModal = new TEMPDroneModal(req.body)
        await tempModal.save()
        req.session.regestringModal = tempModal._id
        res.redirect('uloadImgandFirm')
    } catch(e) {
        console.log(e)
        res.render('pages/505Error')
    }
})

router.get('/uloadImgandFirm', redirectHome, (req, res) =>{
    try{
        const success_msg = req.flash('success_msg')[0]
        const error_msg = req.flash('error_msg')[0]
        const warning_msg = req.flash('warning_msg')[0]
        if(!req.session.regestringModal){
            return res.redirect('/developer/dronemodal/')
        }
        res.render('pages/droneModal/newModalFirmAndImg', {
            success_msg,
            error_msg,
            warning_msg
        })
    } catch(e) {
        console.log(e)
        res.render('pages/505Error')
    }
})

router.post('/uloadImgandFirm', redirectHome, imageAndFirmwareUpload, async (req, res) => {
    try{
        const { version } = (JSON.parse(JSON.stringify(req.body)))
        if(!/^(?:(\d+)\.)?(?:(\d+)\.)?(\*|\d+)$/.test(version)){
            req.flash('error_msg', 'Please reupload, your Version was not valid XX.XX.XX')
            return res.redirect('/uloadImgandFirm')
        }

        if(!req.session.regestringModal){
            res.redirect('/developer/dronemodal/')
            return res.redirect('/uloadImgandFirm')
        }
        if(req.multerImageUploadError && req.multerFileUploadError){
            req.flash('error_msg', 'Error in uploading both image and firmware, please check conditions below and reupload file and image.')
            return res.redirect('/uloadImgandFirm')
        }
        if(req.multerFileUploadError){
            req.flash('error_msg', 'Error in uploading firmware file, Please check conditions below and reupload file and image.')
            res.redirect('/developer/dronemodal/uloadImgandFirm')
        }
        if(req.multerFileUploadError){
            req.flash('error_msg', 'Error in uploading image, please check conditions below and reupload file and image.')
            return res.redirect('/developer/dronemodal/uloadImgandFirm')
        }
        
        const imageBuffer = await compressImage(req.files.imageFile[0].buffer)
        if(!imageBuffer){
            req.flash('error_msg', 'Something is wrong with image, upload differentfile and reupload file.')
            return res.redirect('/developer/dronemodal/uloadImgandFirm')
        }

        const modal = await TEMPDroneModal.findById(req.session.regestringModal, {_id:0, expireAfterSeconds:0})
        delete modal._doc.__v

        const modalNameExesit = await DroneModal.find({modalName:modal._doc.modalName}, {_id:1,modalName:1})
        const modalNumberExesist = await DroneModal.find({modalNumber:modal._doc.modalNumber}, {_id:1,modalName:1})
        if(modalNameExesit.length && modalNumberExesist.length){
                req.flash('error_msg', 'Modal with current name and number already exesist.')
                return res.redirect('newModal')
        } else if(modalNameExesit.length){
            req.flash('error_msg','Modal with current name already exesist.')
                return res.redirect('newModal')
        } else if(modalNumberExesist.length) {
                req.flash('error_msg','Modal wiht current number already exesist.')
                return res.redirect('newModal')
        }

        const build = new DroneModal({
            ...(modal._doc),
            modalImage:imageBuffer,
            firmwareRegistry:[{
                ...req.files.firmFile[0],
                version
            }],
            latestFirmware:{
                ...req.files.firmFile[0],
                version
            }
        })
        await build.save()

        req.session.regestringModal = undefined
        req.flash('success_msg', `${build.modalName} is registered succesfully`)
        res.redirect('/developer/dronemodal/')
    } catch(e) {
        console.log(e)
        res.render('pages/505Error')
    }
})

router.get('/cancle', redirectHome, (req, res) => {
    try{
        req.session.regestringModal = undefined
        req.flash('success_msg', 'Modal registrtion is cancled.')
        res.redirect('/developer/dronemodal/')
    } catch(e) {
        console.log(e)
        res.render('pages/505Error')
    }
})

router.get('/viewModal/:id', redirectHome, async (req, res) => {
    try{
        const id = req.params.id
            if(!id){
                req.flash('error_msg', 'Please provide id of modal')
                return res.redirect(`/developer/dronemodal/viewModal/${id}`)
            }
        const modal = await DroneModal.findById(id, {
            latestFirmware:0,
            'firmwareRegistry.fieldname': 0, 'firmwareRegistry.originalname': 0, 'firmwareRegistry.encoding': 0, 'firmwareRegistry.mimetype': 0, 'firmwareRegistry.buffer': 0, 'firmwareRegistry.size': 0
        })

        if(!modal){
            req.flash('error_msg', 'There is no modal with this id in our database.')
            return res.redirect(`/developer/dronemodal/`)
        }

        const isdeletable = (!modal.drones && 1)
        console.log(isdeletable)
        const success_msg = req.flash('success_msg')[0]
        const error_msg = req.flash('error_msg')[0]
        const warning_msg = req.flash('warning_msg')[0]

        req.session.regestringModal = undefined
        res.render('pages/droneModal/viewModal', {
            modal,
            success_msg,
            error_msg,
            warning_msg,
            isdeletable
        })
    } catch(e) {
        console.log(e)
        res.render('pages/505Error')
    }
})

router.get('/deletemodal/:id', redirectHome, async (req, res) =>{
    try{
        const id = req.params.id
        if(!id){
            req.flash('error_msg', 'Please provide id of modal')
            return res.redirect(`/developer/dronemodal/`)
        }

        const modal = await DroneModal.findById(id)
        if(!modal){
            req.flash('error_msg', 'Given modal not found in database.')
            return res.redirect(`/developer/dronemodal/viewModal/${id}`)
        }

        if(modal.drones !== 0){
            req.flash('warning_msg', 'Can"t delete modal, drone with given modals exesist')
            return res.redirect(`/developer/dronemodal/viewModal/${id}`)
        }

        await modal.remove()
        req.flash('success_msg', `Modal ${modal.modalName} is deleted successfully.`)
        res.redirect('/developer/droneModal')
    } catch(e){
        console.log(e)
        res.render('pages/505Error')
    }
})

router.post('/uloadFirmware/:id', redirectHome, uploadFirm, async (req, res) => {
    {
        try{
            const id = req.params.id
            if(!id){
                req.flash('error_msg', 'Please provide id of modal')
                return res.redirect(`/developer/dronemodal/`)
            }
            const { version } = (JSON.parse(JSON.stringify(req.body)))
            if(!/^(?:(\d+)\.)?(?:(\d+)\.)?(\*|\d+)$/.test(version)){
                req.flash('error_msg', 'Please reupload, your Version was not valid XX.XX.XX')
                return res.redirect(`/developer/dronemodal/viewModal/${id}`)
            }

            if(req.multerFileUploadError || !req.file){
                req.flash('error_msg', 'Firmware file is not a valid file')
                return res.redirect(`/developer/dronemodal/viewModal/${id}`)
            }

            const modal = await DroneModal.updateOne({_id:id},{ $addToSet:{
                firmwareRegistry:{...(req.file), version: version}
                }, 
                latestFirmware:{...(req.file), version: version}
            })

            if(!modal.nModified){
                req.flash('error_msg', 'Firmware not upload on database try again, if problem persist contact coustmer sercvice')
                return res.redirect(`/developer/dronemodal/viewModal/${id}`)
            }

            if(!modal){
                req.flash('error_msg', 'Modal you are uloading is not present in database')
                return res.redirect(`/developer/dronemodal/`)
            }

            req.flash('success_msg', 'New firm is updated successfully')
            res.redirect(`/developer/dronemodal/viewModal/${id}`)
        } catch(e) {
            console.log(e)
            res.render('pages/505Error')
        }
    }
})

module.exports = router