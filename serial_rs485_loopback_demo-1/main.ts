////////////////////////////////////////////////////////////
// IoT Engineering Education @ KMUTNB
// Date: 2019-02-15
// Description: 
//    serial loopback test with line count info
//
////////////////////////////////////////////////////////////

let TX_PIN = SerialPin.P0
let RX_PIN = SerialPin.P1
let BAUDRATE = 115200

serial.redirect(TX_PIN, RX_PIN, BAUDRATE)

let cnt = 0, prev_cnt = 0

// expect newline (NL) as delimiter
serial.onDataReceived("\n", function () {
    let s = serial.readUntil("\n")
    serial.writeLine('> ' + s)
    cnt++
})

basic.forever(function () {
    if (cnt != prev_cnt) {
        serial.writeLine('line count: ' + cnt)
        prev_cnt = cnt
    }
    basic.pause(10)
})

////////////////////////////////////////////////////////////

