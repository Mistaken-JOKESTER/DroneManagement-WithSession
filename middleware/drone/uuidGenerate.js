const { exists } = require('../../modals/DroneModal')
const Drone = require('../../modals/DroneModal')

const uuidGenerate =async () => {
    var UUID
    var exesist = undefined
    do{
        UUID = await (Math.floor((Math.random() * 0x100000000000000000000000000000000) + 1)).toString(16).toUpperCase();
        exesist = await Drone.findOne({UUID})
    } while(exesist)

    return UUID
}

module.exports = uuidGenerate