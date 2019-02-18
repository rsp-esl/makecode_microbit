///////////////////////////////////////////////////////////////////
// IoT Engineering Education @ KMUTNB
// Date: 2019-02-17
// Description:
//   Read temperature and relative humidity values from
//   HTU21D/SHT21/Si7021 sensor (default I2C address = 0x40).
///////////////////////////////////////////////////////////////////

serial.redirectToUSB()

let DEFAULT_ADDR = 0x40

function byte2hex_str(x: number) {
    let s = ''
    let digits = '0123456789abcdef'
    if (0 <= x && x <= 0xff) {
        s += digits.charAt( (x >> 4) & 0x0f )
        s += digits.charAt( x & 0x0f )
    }
    return s
}

function scan_devices() {
    let buf = pins.createBuffer(1)
    buf.setNumber(NumberFormat.UInt8LE, 0xff, 0)
    serial.writeLine('I2C device scanning...')
    let found_devices: number[] = []
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
    if ( a == DEFAULT_ADDR ) { 
        i2c_addr = a
    }
})

if (i2c_addr != 0) {
    serial.writeLine('access device at 0x' + byte2hex_str(i2c_addr))
}

function crc8( data: number[] ) : number {
    let crc  = 0x00
    let crc8_poly = 0x31 // 0x31=0b00110001 <=> x^8+x^5+x^4+x^0
    for (let i = 0; i < data.length; i++) {
        crc = crc ^ data[i]
        for (let b = 0; b < 8; b++) {
            let t = crc << 1
            if ((crc & 0x80) == 0x80) {
                crc = (t ^ crc8_poly)
            } else {
                crc = t
            }
        }
    }
    return (crc & 0xff)
}

function read_data(a: number, reg: number) {
    pins.i2cWriteNumber(a, reg, NumberFormat.UInt8LE)
    basic.pause(50)
    let buf = pins.i2cReadBuffer(a, 3)
    if ( buf.length == 3 ) {
        let hi = buf.getNumber(NumberFormat.UInt8LE, 0)
        let lo = buf.getNumber(NumberFormat.UInt8LE, 1)
        let crc = buf.getNumber(NumberFormat.UInt8LE, 2)
        let value = (hi << 8) | lo
        let data: number[] = [0, 0]
        data[0] = hi
        data[1] = lo
        let _crc = crc8(data)
        if ( data[0] == 0 && data[1] == 0 ) {
            serial.writeLine('I2C read error')
            return null
        }
        if (_crc == crc) { // crc ok
            return value
        } else { // crc error
            serial.writeLine('crc error')
            return null
        }
    } else {
        serial.writeLine('I2c read error' )
    }
    return null
}

function read_temperature( a: number ) {
    let t = read_data( a, 0xf3 )
    if ( t != null ) {
        t = (-46.85 + (175.72 * t) / 65536)
        t = Math.round(100 * t)
        return (t/100)
    } 
    return t
}

function read_humidity( a: number ) {
    let h = read_data( a, 0xf5 )
    if ( h != null ) {
        h = (-6 + (125.0 * h)/65536)
        h = Math.round(100 * h)
        return (h/100) 
    } 
    return h
}
function toFixedString(x: number, len : number = 3 ) {
    x += 5.0/Math.pow(10, len+1)
    let s = x.toString() 
    let pos = s.indexOf('.')
    if (pos >= 0) {
        return s.substr(0, pos+len+1 )
    }
    return s
}
basic.forever(function () { 
    if (i2c_addr != 0 ) {
        let t = read_temperature( i2c_addr )
        serial.writeLine( 'temperature: ' + toFixedString(t,2) )
        let h = read_humidity( i2c_addr )
        serial.writeLine( 'humidity: ' + toFixedString(h,2) )
        basic.pause(1000)
    }
})
///////////////////////////////////////////////////////////////////
