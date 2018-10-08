/////////////////////////////////////////////////////////////////////
// bh1750_test
/////////////////////////////////////////////////////////////////////

let intensity = 0
let bh1750: CustomSensors.BH1750 = null
bh1750 = CustomSensors.createBH1750(35)
serial.writeLine("\r\nBH1750 test...")
basic.forever(() => {
    intensity = bh1750.getIntensity()
    serial.writeLine("Light Intensity (Lx): " + intensity)
    basic.showNumber(intensity)
    basic.pause(500)
})
/////////////////////////////////////////////////////////////////////
