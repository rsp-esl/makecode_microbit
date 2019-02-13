/////////////////////////////////////////////////////////////
// IoT Engineering Education @ KMUTNB
// Date: 2019-02-13
// Description: 
//   Display some graphic symbols on an 8x8 LED matrix display 
//   controlled by two cascaded 74HC595 chips.
//
// Wiring:
//  - P13 --> CLK pin of the display module
//  - P15 --> DIN pin of the display module
//  - P16 ---> LATCH pin of the display module
//  - used 3.3V and GND pins from Microbit as voltage supply
//    to the display module
/////////////////////////////////////////////////////////////

let SCLK = DigitalPin.P13
let DATA = DigitalPin.P15
let LATCH = DigitalPin.P16

pins.digitalWritePin(LATCH, 0)

// spi pins for mosi, miso, sck pins respectively
pins.spiPins(DigitalPin.P15, DigitalPin.P14, DigitalPin.P13)
pins.spiFormat(8, 0) // 8 bit data format, SPI mode 0
pins.spiFrequency(500000) // 500kHz

//////////////////////////////////////////////////////
let symbols: number[][] = [
    [ // sad
        0b00111100,
        0b01000010,
        0b10100101,
        0b10000001,
        0b10011001,
        0b10100101,
        0b01000010,
        0b00111100,
    ],
    [  // happy
        0b00111100,
        0b01000010,
        0b10100101,
        0b10000001,
        0b10100101,
        0b10011001,
        0b01000010,
        0b00111100,
    ],
    [ //  very happy
        0b00000000,
        0b01000010,
        0b11100111,
        0b01000010,
        0b00000000,
        0b01000010,
        0b00111100,
        0b00000000,
    ],
    [ // heart 
        0b01100110,
        0b11111111,
        0b11111111,
        0b11111111,
        0b01111110,
        0b00111100,
        0b00011000,
        0b00000000,
    ]
]
//////////////////////////////////////////////////////

// reverse the bit order of a byte data
function reverse_byte(x: number) {
    let r = 0
    for (let i = 0; i < 8; i++) {
        r |= ((x >> i) & 1) << (7 - i)
    }
    return r
}

// 'data' is an array of 8 bytes.
function show(data: number[]) {
    for (let r = 0; r < 8; r++) {
        let v = reverse_byte(data[r])
        // MSB first shifting
        pins.spiWrite(v ^ 0xff) // row data (inverse)
        pins.spiWrite(1 << r)   // row select
        pins.digitalWritePin(LATCH, 1)
        pins.digitalWritePin(LATCH, 0)
        control.waitMicros(200)
    }
    // clear display 
    pins.spiWrite(0)
    pins.spiWrite(0)
    pins.digitalWritePin(LATCH, 1)
    pins.digitalWritePin(LATCH, 0)
}

let index = 0
let interval_ms = 1000

control.inBackground(function () {
    let ts = input.runningTime()
    while (true) {
        if (input.runningTime() - ts >= interval_ms) {
            ts += interval_ms // update next time
            index = (index + 1) % symbols.length
        }
        basic.pause(20)
    }
})

control.inBackground(function () {
    while (true) {
        show(symbols[index])
        basic.pause(0)
    }
})
//////////////////////////////////////////////////////

