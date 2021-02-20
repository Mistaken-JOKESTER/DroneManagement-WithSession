const generateOtp = async () =>{
    //generating Otp
    var minm = 1000000; 
    var maxm = 9999999; 
    const otp = await Math.floor(Math.random() * (maxm - minm + 1)) + minm
    console.log(`otp genrated ${otp}`)
    return otp
}

module.exports = generateOtp