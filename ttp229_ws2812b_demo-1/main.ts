/////////////////////////////////////////////////////////////////
// IoT Engineering Education @ KMUTNB
// Date: 2019-02-14
// Description:
//    Read key states from a TTP229-based 4x4 Keypad,
//    Turn on the RGB LEDs on WS2812B-based 16-LED matrix 
//    according to the key state (the number of RGB LEDs turned on
//    are equal to the value of keycode plus 1)
// 
// TTP229 4x4 keypad (use 3.3V voltage supply)
//   - SCK pin to Microbit's Pin 0
//   - SDO pin to Microbit's Pin 1
// NeoPixel RGB LED matrix (use 3.3V voltage supply)
//   - DATA pin to Microbit's Pin 2
/////////////////////////////////////////////////////////////////

serial.redirectToUSB()

let SCK = DigitalPin.P0
let SDO = DigitalPin.P1

pins.digitalWritePin(SCK, 1)

let touchDetected: boolean = false
let strip = neopixel.create(DigitalPin.P2, 16, NeoPixelMode.RGB)
strip.clear()
strip.show()

pins.onPulsed(SDO, PulseValue.Low, function () {
    touchDetected = true
})

function readKeys() {
    let value = 0
    for (let i = 0; i < 16; i++) {
        pins.digitalWritePin(SCK, 0)
        control.waitMicros(20)
        pins.digitalWritePin(SCK, 1)
        control.waitMicros(20)
        let b = pins.digitalReadPin(SDO)
        value = (b << 15) | (value >> 1)
    }
    return value
}

function word2str(value: number) {
    let s = ''
    for (let i = 0; i < 16; i++) {
        s += ((value >> (15 - i)) & 1)
    }
    return s
}

basic.forever(function () {
    if (touchDetected) {
        let keys = readKeys()
        if (keys != 0xffff) {
            serial.writeLine(word2str(keys))
            let x = keys ^ 0xffff
            strip.clear()
            for (let i = 0; i < 16; i++) {
                strip.setPixelColor(i, 0x00003f)
                if ((x & 1) == 1) {
                    break
                }
                x = x >> 1
            }
            strip.show()
        }
        touchDetected = false
    }
})
/////////////////////////////////////////////////////////////////
