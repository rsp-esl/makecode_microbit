let SCLK = DigitalPin.P13
let DATA = DigitalPin.P15
let LATCH = DigitalPin.P16

pins.digitalWritePin(LATCH, 0)

// spi pins for mosi, miso, sck pins respectively
pins.spiPins(DigitalPin.P15, DigitalPin.P14, DigitalPin.P13)
pins.spiFormat(8, 0) // 8 bit , mode 0

pins.spiFrequency(100000)

function reverse_byte(x: number) { // reverse the bit order of a byte data
    let r = 0
    for (let i = 0; i < 8; i++) {
        r |= ((x >> i) & 1) << (7 - i)
    }
    return r
}

// 'data' is an array of 8 bytes.
function shiftDataDigits(data: number[]) {
    for (let c = 0; c < 8; c++) {
        let v = reverse_byte(data[c])
		// MSB first shifting
        pins.spiWrite(v ^ 0xff) // row data (inverse)
        pins.spiWrite(1 << c)   // row select
        //control.waitMicros(25)
        pins.digitalWritePin(LATCH, 1)
        pins.digitalWritePin(LATCH, 0)
        control.waitMicros(150)
    }
}

let index = 0
control.inBackground(function () {
    let ts = input.runningTime()
    while (true) {
        if (input.runningTime() - ts >= 1000) {
            ts += 1000  // update next time
            index = (index + 1) % 2
        }
        basic.pause(1)
    }
})

let symbols: number[][] = [ // heart symbols
    [
        0b00000000,
        0b01100110,
        0b11111111,
        0b11111111,
        0b01111110,
        0b00111100,
        0b00011000,
        0b00000000,
    ],
    [
        0b00000000,
        0b01100110,
        0b10011001,
        0b10000001,
        0b01000010,
        0b00100100,
        0b00011000,
        0b00000000,
    ]
]

control.inBackground(function () {
    while (true) {
        shiftDataDigits(symbols[index])
        basic.pause(0)
    }
})
