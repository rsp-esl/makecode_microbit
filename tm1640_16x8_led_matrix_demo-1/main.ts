/////////////////////////////////////////////////////////////////////
// IoT Engineering Education @ KMUTNB
// Date: 2019-02-14
// Description:
//     Display a 3-digit counter on TM1640-based 16x8 LED display
// 
/////////////////////////////////////////////////////////////////////
let SCK = DigitalPin.P13
let DIN = DigitalPin.P15
///////////////////////////////////////////////////////

let TM1640_CMD_DATA = 0x40  // data command CMD1
let TM1640_CMD_ADDR = 0xC0  // address command CMD2
let TM1640_CMD_DISP = 0x80  // display control command CMD3
let TM1640_DSP_ON = 0x08  // display on
let TM1640_FIXED = 0x04  // fixed address mode

let intensity = 7
let buf: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] // 20-byte buffer

function tm1640_writeCmd(value: number) {
    tm1640_start()
    tm1640_writeByte(value)
    tm1640_stop()
}

function tm1640_setBrightness(level: number) {
    if (level > 7) {
        intensity = 7
    } else {
        intensity = level & 0x07
    }
    tm1640_writeCmd(TM1640_CMD_DISP | TM1640_DSP_ON | intensity) // set brightness and turn display on
}

function tm1640_start() {
    // Start condition
    pins.digitalWritePin(SCK, 1)
    control.waitMicros(10)
    pins.digitalWritePin(DIN, 0)
    control.waitMicros(10)
}

function tm1640_stop() {
    // Stop condition
    pins.digitalWritePin(DIN, 0)
    control.waitMicros(10)
    pins.digitalWritePin(SCK, 0)
    control.waitMicros(10)
    pins.digitalWritePin(SCK, 1)
    control.waitMicros(10)
    pins.digitalWritePin(DIN, 1)
    control.waitMicros(10)
}

function tm1640_writeByte(data: number, msbfirst: boolean = false) {
    for (let i = 0; i < 8; i++) {
        pins.digitalWritePin(SCK, 0)
        control.waitMicros(10)
        if (msbfirst) {
            pins.digitalWritePin(DIN, (data >> (7 - i)) & 1)
        } else {
            pins.digitalWritePin(DIN, (data >> i) & 1)
        }
        pins.digitalWritePin(SCK, 1)
        control.waitMicros(10)
    }
}

function tm1640_init() {
    pins.digitalWritePin(SCK, 1)
    pins.digitalWritePin(DIN, 1)
}

function tm1640_clear_buf() {
    for (let i = 0; i < buf.length; i++) {
        buf[i] = 0
    }
}

function tm1640_writeData(
    addr: number,
    data: number[],
    num_bytes: number, msbfirst: boolean = false) {

    tm1640_writeCmd(TM1640_CMD_DATA)
    tm1640_start()
    let value = TM1640_CMD_ADDR | (addr & 0x0f)
    tm1640_writeByte(value)
    for (let k = 0; k < num_bytes; k++) {
        let _data = data[k]
        tm1640_writeByte(_data, msbfirst)
    }
    tm1640_stop()
}

///////////////////////////////////////////////////////

let DIGITS_FONT: number[][] = [
    [0xfe, 0x82, 0x82, 0xfe], // 0
    [0x00, 0x82, 0xfe, 0x80], // 1
    [0xf2, 0x92, 0x92, 0x9e], // 2
    [0x92, 0x92, 0x92, 0xfe], // 3
    [0x1e, 0x10, 0x10, 0xfe], // 4
    [0x9e, 0x92, 0x92, 0xf2], // 5
    [0xfe, 0x92, 0x92, 0xf2], // 6
    [0x02, 0xe2, 0x12, 0x0e], // 7
    [0xfe, 0x92, 0x92, 0xfe], // 8
    [0x9e, 0x92, 0x92, 0xfe]  // 9
]

control.inBackground(function () {
    tm1640_init()
    tm1640_setBrightness(intensity) // set brightness and turn display on
    tm1640_writeData(0, buf, 16)
    basic.pause(1000)
    let cnt = 0
    let digits: number[] = [0, 0, 0]

    while (true) {
        tm1640_clear_buf()
        for (let i = 0; i < 3; i++) { // 3 number digits
            let data = DIGITS_FONT[digits[i]]
            for (let j = 0; j < 4; j++) { // 4 pixels font width
                buf[1 + ((1 + 4) * i) + j] = data[j]
            }
        }
        tm1640_writeData(0, buf, 16, false)
        basic.pause(100)

        cnt = (cnt + 1) % 1000
        digits[0] = Math.idiv(cnt, 100) % 10
        digits[1] = Math.idiv(cnt, 10) % 10
        digits[2] = cnt % 10
    }
})
/////////////////////////////////////////////////////////////////////