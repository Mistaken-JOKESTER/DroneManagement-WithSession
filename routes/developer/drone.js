const router = require('express').Router()
const DroneModal = require('../../modals/DroneModal')
const Drone = require('../../modals/Drone')
const buildDrone = require('../../middleware/drone/buildDroneAndDgcaRegister')
const {redirectHome} = require('../../middleware/developer/developerAuth')
const droneDataValidation = require('../../middleware/drone/dataValidation')

router.get('/', redirectHome, async (req, res) => {
    try{
        const drones = await Drone.find({})
        //cheching ig any message present form previous redirect
        const success_msg = req.flash('success_msg')[0]
        const error_msg = req.flash('error_msg')[0]
        const warning_msg = req.flash('warning_msg')[0]
        res.render('pages/drones/drones', {
            success_msg,
            error_msg,
            warning_msg,
            drones
        })
    } catch(e) {
        console.log(e)
        return res.status(500).render('pages/505Error')
    }
})

router.get('/newDrone', redirectHome, async (req, res) => {
    try{
        //cheching ig any message present form previous redirect
        const success_msg = req.flash('success_msg')[0]
        const error_msg = req.flash('error_msg')[0]
        const warning_msg = req.flash('warning_msg')[0]
        const modals = await DroneModal.find({},{_id:1, modalName:1})
        res.render('pages/drones/newDrone', {
            modals,
            success_msg,
            error_msg,
            warning_msg
        })
    } catch(e) {
        console.log(e)
        return res.status(500).render('pages/505Error')
    }
})

router.post('/newDrone', redirectHome, droneDataValidation, async (req, res) => {
    try{
        const modals = await DroneModal.find({},{_id:1, modalName:1})
        if(!req.body.valid){
            return res.render('pages/drones/newDrone', {
                modals,
                errors:req.body.errors,
                assignedTo:req.body.data.assignedTo,
                flightControllerNumber:req.body.data.flightControllerNumber,
                modalName:req.body.data.modalName,
                buildDate:req.body.data.buildDate
            })
        }
        
        const drone  = await buildDrone(req.body)
        if(!drone.status){
            return res.render('pages/drones/newDrone', {
                modals,
                error_msg:'Failed to register on DGCA website please contact suppoert',
                assignedTo:req.body.data.assignedTo,
                flightControllerNumber:req.body.data.flightControllerNumber,
                modalName:req.body.data.modalName,
                buildDate:req.body.data.buildDate
            })
        }

        const modal = await DroneModal.updateOne({_id:drone.body.data.modalId},{inAir:Number(drone.body.data.droneNo)})
        if(!modal.nModified){
            req.flash('error_msg', 'something went wrong try again, your dorne is not registered.')
            return res.redirect('newDrone')
        }

        const droneDone = new Drone(drone.body.data)
        await droneDone.save()

        req.flash('success_msg', 'Your dorne is registered successfully')
        res.redirect('/developer/drones/')
    } catch(e) {
        console.log(e)
        return res.status(500).render('pages/505Error')
    }
})

router.get('/viewDrone/:id', redirectHome, async (req, res) => {
    try{
        const success_msg = req.flash('success_msg')[0]
        const error_msg = req.flash('error_msg')[0]
        const warning_msg = req.flash('warning_msg')[0]

        const id = req.params.id
        if(!id || id == ''){
            req.flash('warning_msg','Drone with given id does not exesist.')
            return res.redirect(`/developer/drones/`)
        }

        const drone = await Drone.findById(id)
        console.log(drone)
        if(!drone){
            req.flash('warning_msg','Drone with given id does not exesist.')
            return res.redirect(`/developer/drones/`)
        }

        res.render('pages/drones/viewDrone', {
            drone,
            success_msg,
            warning_msg,
            error_msg
        })
    } catch (e) {
        console.log(e)
        return res.status(500).render('pages/505Error')
    }
})

router.get('/deregister/:id', redirectHome, async (req, res) => {
    try{
        const id = req.params.id
        if(!id || id == ''){
            req.flash('warning_msg','Drone with given id does not exesist.')
            return res.redirect(`/developer/drones/viewDrone/${id}`)
        }

        const drone = await Drone.findById(id)
        if(!drone){
            req.flash('warning_msg','Drone with given id does not exesist.')
            return res.redirect(`/developer/drones/viewDrone/${id}`)
        }

        console.log(drone)

        const status = await drone.deregister()
        console.log(status)
        if(!status){
            req.flash('warning_msg','Failed to deregister drone try agian.')
            return res.redirect(`/developer/drones/viewDrone/${id}`)
        }

        await drone.remove(function (err, drone) {
            if (err){
                req.flash('error_msg','Drone is not removed but deregistred form DGCA.')
                return res.redirect(`/developer/drones/viewDrone/${id}`)
            }
        })

        req.flash('success_msg', `Drone ${drone.flightControllerNumber} is deregistred and deleted form database.`)
        res.redirect('/developer/drones/')
    } catch (e) {
        console.log(e)
        return res.status(500).render('pages/505Error')
    }
})

module.exports = router