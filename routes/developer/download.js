const router = require('express').Router()

const {redirectHome} = require('../../middleware/developer/developerAuth')

const Customer = require('../../modals/Customer')
const Drone = require('../../modals/Drone')
const DroneModal = require('../../modals/DroneModal')

router.get('/', redirectHome, (req, res) => {
    res.send('downlaod')
})

router.get('/downloadLatestFirmware/:id', redirectHome, async (req, res) => {
    try{
        const { id } = req.params
        console.log(id)
        if(!id || id == "")
            return res.status(403).send({error:{message:'Provide a modal id for latest firmware version.', id:false}})
           
        const firm = await DroneModal.findById(id, {latestFirmware:1})

        if(!firm){
            return res.status(404).send({error:{message:"Modal not found"}})
        }

        const { latestFirmware } = firm
        console.log(latestFirmware)
        res.setHeader('Content-disposition', 'attachment; filename=' + `${latestFirmware.version}_${latestFirmware.originalname}`)
        res.setHeader('Content-type', latestFirmware.mimetype)

        res.send(latestFirmware.buffer)
    } catch(e) {
        console.log(e)
        res.status(500).send({error:{message:"Something went wrong Please try again."}})
    }
})

router.get('/downloadFirmware/:id', redirectHome, async (req, res) => {
    try{
        const { id } = req.params
        const { fid } = req.query
        console.log(id, fid)
        if(!id || id == "")
            return res.status(403).send({error:{message:'Provide a modal id for latest firmware version.', id:false}})
         
        if(!fid || fid=="")
            return res.status(403).send({error:{message:'Provide a firmware id for download.', fid:false}})
        
        const firm = await DroneModal.findById(id, {_id: 0, firmwareRegistry: {"$elemMatch": {_id: fid}}})
        console.log(firm)

        if(!firm){
            return res.status(404).send({error:{message:"Drone Modal not found."}})
        }

        if(!firm.firmwareRegistry[0]){
            return res.status(404).send({error:{message:"Firmware you are serching for not found."}})
        }

        const firmware = firm.firmwareRegistry[0]
        console.log(firmware)
        res.setHeader('Content-disposition', 'attachment; filename=' + `${firmware.version}_${firmware.originalname}`)
        res.setHeader('Content-type', firmware.mimetype)

        res.send(firmware.buffer)
    } catch(e) {
        console.log(e)
        return res.status(500).render('pages/505Error')
    }
})

router.get('/log/:id', redirectHome, async (req, res) => {
    try{
        const { id } = req.params
        const { lid } = req.query
        console.log(id, lid)
        if(!id || !lid || id == '' || lid == '')
            return res.status(403).send({error:{message:'Invalid Reqeust.', id:id&&1, lid:lid&&1}})

        const logs = await Drone.findById(id, {_id: 0, logRegistry: {"$elemMatch": {_id: lid}}})
        console.log(logs)
    
        if(!logs){
            return res.status(404).send({error:{message:"Drone Modal not found."}})
        }
    
        if(!logs.logRegistry[0]){
            return res.status(404).send({error:{message:"Log, you are serching for not found."}})
        }
    
        const log = logs.logRegistry[0]
        let date = new Date(log.date)
        let dateString = date.toLocaleDateString()
        console.log(log)
        res.setHeader('Content-disposition', 'attachment; filename=' + `${dateString}_${log.originalname}`)
        res.setHeader('Content-type', log.mimetype)
    
        res.send(log.buffer) 
    } catch(e) {
        console.log(e)
        return res.status(500).render('pages/505Error')
    }
})

router.get('/key/:id', redirectHome, async (req, res) => {
    try{
        const { id } = req.params
        const { kid } = req.query
        if(!id || !kid || id == '' || kid == '')
            return res.status(403).send({error:{message:'Invalid Reqeust.', id:id&&1, kid:kid&&1}})

        const keys = await Drone.findById(id, {_id: 0, keyRegistry: {"$elemMatch": {_id: kid}}})
        console.log(keys)
    
        if(!keys){
            return res.status(404).send({error:{message:"Drone Modal not found."}})
        }
    
        if(!keys.keyRegistry[0]){
            return res.status(404).send({error:{message:"key, you are serching for not found."}})
        }
        
        const key = keys.keyRegistry[0]
        let date = new Date(key.date)
        let dateString = date.toLocaleDateString()
        console.log(key)
        res.setHeader('Content-disposition', 'attachment; filename=' + `${dateString}_${key.originalname}`)
        res.setHeader('Content-type', key.mimetype)
    
        res.send(key.buffer) 
    } catch(e) {
        console.log(e)
        return res.status(500).render('pages/505Error')
    }
})

module.exports = router