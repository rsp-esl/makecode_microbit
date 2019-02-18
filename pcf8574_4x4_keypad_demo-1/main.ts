//////////////////////////////////////////////////
// IoT Engineering Education @ KMUTNB
// Date: 2019-02-16
// Description: 
//    PCF8574(A) + membrane 4x4 keypad
//////////////////////////////////////////////////
// default address for pc8574:  0x20 (A2=A1=A0=0)
// default address for pc8574A: 0x38 (A2=A1=A0=0)

// constants
let keys: string [][] = [
    ['1','2','3','A'],
    ['4','5','6','B'],
    ['7','8','9','C'],
    ['*','0','#','D']
]

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

// PCF8574: P0..P3 output, P4..P7 input (with 4x pull-up resistors)
function getKey( a: number ) { // blocking function call
    let value = 0
    let key = ''
    for ( let row=0; row < 4; row++ ) { 
        value = ~(1 << (row+4)) | 0x0f
        pins.i2cWriteNumber(a, value, NumberFormat.UInt8LE)
        value = pins.i2cReadNumber(a, NumberFormat.UInt8LE)
        for ( let col=0; col < 4; col++ ) {
            if ( ((value >> col) & 1) == 0 ) { // found a keypress
                key = keys[3 - row][3 - col] 
                break
            }
        }
        if (key != '') { // found a keypress
            let cnt = 0
            let new_value = value
            // wait for key release or timeout
            while (value == new_value && cnt++ < 20 ) {
                new_value = pins.i2cReadNumber(a, NumberFormat.UInt8LE)
                basic.pause(50)
            } 
            pins.i2cWriteNumber(a, 0xff, NumberFormat.UInt8LE)
            return key // keypress
        } 
    }
    pins.i2cWriteNumber(a, 0xff, NumberFormat.UInt8LE)
    return key // no keypress
}

let devices = scan_devices()
let i2c_addr = 0
devices.forEach(function (a, i) { 
    if ( (a & ~0x07) == 0x20 || (a & ~0x07) == 0x38) {
        i2c_addr = a
    }
})

serial.writeLine('Scan key at address = 0x' + byte2hex_str(i2c_addr) )

basic.forever(function () { 
    if ( i2c_addr !== 0 ) {
        let key = getKey( i2c_addr )
        if ( key != '' ) {
           serial.writeLine( "key pressed: " + key )
        }
        basic.pause(10)
    }
})
//////////////////////////////////////////////////
