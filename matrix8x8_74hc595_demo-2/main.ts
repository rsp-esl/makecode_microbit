let SCLK = DigitalPin.P13
let DATA = DigitalPin.P15
let LATCH = DigitalPin.P16

pins.digitalWritePin(SCLK, 0)
pins.digitalWritePin(DATA, 0)
pins.digitalWritePin(LATCH, 0)

let DIGITS: number[][] = [
    // 0
    [
        0b00000000,
        0b00001110,
        0b00001010,
        0b00001010,
        0b00001010,
        0b00001010,
        0b00001010,
        0b00001110,
    ],
    // 1
    [
        0b00000000,
        0b00000100,
        0b00001100,
        0b00000100,
        0b00000100,
        0b00000100,
        0b00000100,
        0b00001110
    ],
    // 2
    [
        0b00000000,
        0b00001110,
        0b00000010,
        0b00000010,
        0b00001110,
        0b00001000,
        0b00001000,
        0b00001110,
    ],
    // 3
    [
        0b00000000,
        0b00001110,
        0b00000010,
        0b00000010,
        0b00001110,
        0b00000010,
        0b00000010,
        0b00001110,
    ],
    // 4
    [
        0b00000000,
        0b00001010,
        0b00001010,
        0b00001010,
        0b00001111,
        0b00000010,
        0b00000010,
        0b00000010,
    ],
    // 5
    [
        0b00000000,
        0b00001110,
        0b00001000,
        0b00001000,
        0b00001110,
        0b00000010,
        0b00000010,
        0b00001110,
    ],
    // 6
    [
        0b00000000,
        0b00001110,
        0b00001000,
        0b00001000,
        0b00001110,
        0b00001010,
        0b00001010,
        0b00001110,
    ],
    // 7
    [
        0b00000000,
        0b00001110,
        0b00001010,
        0b00000010,
        0b00000010,
        0b00000010,
        0b00000010,
        0b00000010,
    ],
    // 8
    [
        0b00000000,
        0b00001110,
        0b00001010,
        0b00001010,
        0b00001110,
        0b00001010,
        0b00001010,
        0b00001110,
    ],
    // 9
    [
        0b00000000,
        0b00001110,
        0b00001010,
        0b00001010,
        0b00001110,
        0b00000010,
        0b00000010,
        0b00001110,
    ],

]

let d1 = 0, d0 = 0
let cnt = 0

// 'data' is an array of 8 bytes.
function shiftDataDigits(data: number[]) {
    for (let c = 0; c < 8; c++) {
        let v = data[c]
        let x = (1 << (15 - c)) | (0xff ^ v)
        for (let i = 0; i < 16; i++) {
            let b = (x >> i) & 1;  // LSB first shifting
            pins.digitalWritePin(DATA, b)
            pins.digitalWritePin(SCLK, 1)
            pins.digitalWritePin(SCLK, 0)
        }
        pins.digitalWritePin(LATCH, 1)
        pins.digitalWritePin(LATCH, 0)
        control.waitMicros(150)
    }
}

control.inBackground(function () {
    let ts = input.runningTime()
    while (true) {
        if (input.runningTime() - ts >= 1000) {
            ts += 1000  // update next time
            cnt = (cnt + 1) % 100 // increment counter 
        }
        basic.pause(1)
    }
})

control.inBackground(function() {
    let _cnt = 0;
    let data: number[] = [0, 0, 0, 0, 0, 0, 0, 0]
    while (true) {
        for (let i = 0; i < 8; i++) {
            data[i] = DIGITS[d1][i] << 4 | DIGITS[d0][i]
        }
        shiftDataDigits(data)
        basic.pause(0)
        if (cnt != _cnt) {
            _cnt = cnt;
            d0 = _cnt % 10 // digit for x1
            d1 = Math.idiv(_cnt, 10) // digit for x10
        }
    }
})
