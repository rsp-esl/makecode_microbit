/////////////////////////////////////////////////////////////
// IoT Engineering Education @ KMUTNB
// Date: 2019-02-13
// Description: 
//   Display 0-9 digits on an 8x8 LED matrix display 
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
pins.spiFrequency(500000) // 500 kHz

/////////////////////////////////////////////////////////////

let digit_symbols: number[][] = [
    [   // 0
        0b00111100,
        0b01100110,
        0b01100110,
        0b01100110,
        0b01100110,
        0b01100110,
        0b00111100,
        0b00000000,
    ],
    [   // 1
        0b00011000,
        0b00111000,
        0b00011000,
        0b00011000,
        0b00011000,
        0b00011000,
        0b01111110,
        0b00000000,
    ],
    [   // 2
        0b00111100,
        0b01100110,
        0b00000110,
        0b00011100,
        0b00110000,
        0b01100110,
        0b01111110,
        0b00000000,
    ],
    [   //3
        0b00111100,
        0b01100110,
        0b00000110,
        0b00011100,
        0b00000110,
        0b01100110,
        0b00111100,
        0b00000000,
    ],
    [   // 4
        0b00001100,
        0b00011100,
        0b00110100,
        0b01100100,
        0b01111110,
        0b00000100,
        0b00001110,
        0b00000000,
    ],
    [   // 5
        0b01111110,
        0b01100000,
        0b01111100,
        0b00000110,
        0b00000110,
        0b01100110,
        0b00111100,
        0b00000000,
    ],
    [  // 6
        0b00011100,
        0b00110000,
        0b01100000,
        0b01111100,
        0b01100110,
        0b01100110,
        0b00111100,
        0b00000000,
    ],
    [  // 7
        0b01111110,
        0b01100110,
        0b00000110,
        0b00001100,
        0b00011000,
        0b00011000,
        0b00011000,
        0b00000000,
    ],
    [   // 8
        0b00111100,
        0b01100110,
        0b01100110,
        0b00111100,
        0b01100110,
        0b01100110,
        0b00111100,
        0b00000000,
    ],
    [  // 9
        0b00111100,
        0b01100110,
        0b01100110,
        0b00111110,
        0b00000110,
        0b00001100,
        0b00111000,
        0b00000000,
    ]
]

/////////////////////////////////////////////////////////////

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
            index = (10 + index - 1) % digit_symbols.length // countdown
        }
        basic.pause(20)
    }
})

control.inBackground(function () {
    while (true) {
        show(digit_symbols[index])
        basic.pause(0)
    }
})

/////////////////////////////////////////////////////////////

