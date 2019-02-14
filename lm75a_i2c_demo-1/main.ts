////////////////////////////////////////////////////////////////
// IoT Engineering Education @ KMUTNB
// Date: 2019-02-14
// Description:
//    Read temperature values from an LM75A sensor module.
//
// LM75A Datasheet:
//  - https://www.nxp.com/docs/en/data-sheet/LM75A.pdf
//  - http://www.ti.com/lit/ds/symlink/lm75a.pdf
// Voltage supply: 2.8 V to 5.5 V (use 3.3V from Microbit)
// Digital temperature value: 9-bit resolution (TI), 11-bit (NXP)
// Temperature value range: 55?C to 125?C 
// Temperature accuracy:
//   - +/-2C (Max) for -25 deg.C to +100 deg.C range
//   - +/-3C (Max) for -55 deg.C to +125 deg.C range
// Interfacing: I2C (Default I2C address = 0x48)
//   - address pins: A2, A1, A0 (connect to GND)
//   - connect SCL pin to Microbit's Pin 19
//   - connect SDA pin to Microbit's Pin 20
////////////////////////////////////////////////////////////////

let addr = 0x48
let LM75_TEMP_REG = 0

serial.redirectToUSB()

function read16(reg: number) {
    pins.i2cWriteNumber(addr, reg, NumberFormat.UInt8LE)
    control.waitMicros(10)
    let rbuf = pins.i2cReadBuffer(addr, 2)
    let value = rbuf.getNumber(NumberFormat.Int16BE, 0)
    return value
}

function readTemperature() {
    // for 11-bit resolution: 0.125 ?C per bit
    return (read16(LM75_TEMP_REG) >> 5) * 0.125
}

basic.forever(function () {
    let t = Math.round(10 * readTemperature())
    let str = ''
    str += 'LM75A: '
    str += Math.idiv(t, 10)
    str += '.'
    str += Math.abs(t % 10)
    serial.writeLine(str)
    basic.pause(1000)
})
////////////////////////////////////////////////////////////////


