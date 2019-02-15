////////////////////////////////////////////////////////////
// IoT Engineering Education @ KMUTNB
// Date: 2019-02-15
// Description: 
//    Read analog values from a light sensor (TEMT6000)
//    and send them to the remote computer
//    using RS485 communication link.
//
////////////////////////////////////////////////////////////

let TX_PIN = SerialPin.P0
let RX_PIN = SerialPin.P1
let BAUDRATE = 9600

serial.redirect(TX_PIN, RX_PIN, BAUDRATE)
let vref = 3250 // milli-volts

basic.forever(function () {
    let value = pins.analogReadPin(AnalogPin.P2)
    let mvolts = Math.idiv(vref * value, 1023)
    serial.writeLine('' + mvolts + ' mV')
    basic.pause(200)
})

////////////////////////////////////////////////////////////

