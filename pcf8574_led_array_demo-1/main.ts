//////////////////////////////////////////////////
// IoT Engineering Education @ KMUTNB
// Date: 2019-02-16
// Description: 
//    PCF8574(A) I/O write operation
//    -> connect the 8-bit output pins of PCF8574(A)
//       to an 8-bit LED array (active-low)
//////////////////////////////////////////////////

serial.redirectToUSB()

function byte2hex_str(x: number) {
    let s = ''
    let digits = '0123456789abcdef'
    if (0 <= x && x <= 0xff) {
        s += digits.charAt( (x >> 4) & 0x0f )
        s += digits.charAt( x & 0x0f )
    }
    return s
}

let buf = pins.createBuffer(1)

function scan_devices() {
    buf.setNumber(NumberFormat.UInt8LE, 0xff, 0x00)
    serial.writeLine('I2C device scanning')
    let found_devices : number[] = []
    for (let addr = 1; addr <= 0x7f; addr++) {
        let result = pins.i2cWriteBuffer(addr, buf)
        if (result == 0) {
            serial.writeLine('found device at 0x' + byte2hex_str(addr))
            found_devices.push( addr )
        }
    }
    return found_devices
}

let devices = scan_devices()
let i2c_addr = 0
devices.forEach(function (a, i) { 
    if ( (a & ~0x07) == 0x20 || (a & ~0x07) == 0x38) {
        i2c_addr = a
    }
})

if (i2c_addr != 0) {
    serial.writeLine('use PCF8574(A) at 0x' + byte2hex_str(i2c_addr))
}

let value = 0x01
basic.forever(function () { 
    if (i2c_addr != 0) {
        buf.setNumber(NumberFormat.UInt8LE, 0, value ^ 0xff ) // active-low
        let result = pins.i2cWriteBuffer(i2c_addr, buf)
        value = (value << 1) | ((value >> 7) & 1) // rotate shift left
        basic.pause(100)
    }
})
//////////////////////////////////////////////////
