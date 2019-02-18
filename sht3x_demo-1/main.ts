///////////////////////////////////////////////////////////////////
// IoT Engineering Education @ KMUTNB
// Date: 2019-02-17
// Description:
//   Read temperature and relative humidity values from
//   SHT3x sensor (default I2C address = 0x44).
///////////////////////////////////////////////////////////////////

serial.redirectToUSB()

let DEFAULT_ADDR = 0x44

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

if (i2c_addr == 0) {
    serial.writeLine( 'No SHT3x device found...')
} else {
    serial.writeLine('access device at 0x' + byte2hex_str(i2c_addr))
}

function crc8( hi_byte: number, lo_byte: number ) {
    let crc = 0xff
    crc ^= hi_byte
    for (let i=0; i < 8; i++) {
       crc = crc & 0x80 ? (crc << 1) ^ 0x31 : crc << 1;
    }
    crc ^= lo_byte
    for (let i=0; i < 8; i++) {
       crc = crc & 0x80 ? (crc << 1) ^ 0x31 : crc << 1;
    }
    return crc & 0xff
}

function read_data( a: number ) : number[] {
    let values: number[] = [0, 0]
    let wbuf = pins.createBuffer(2)
    // single shot mode, no clock stretching
    wbuf.setNumber( NumberFormat.UInt8LE, 0, 0x2c )
    wbuf.setNumber( NumberFormat.UInt8LE, 1, 0x06 )
    pins.i2cWriteBuffer(a, wbuf)
    basic.pause(20)

    let buf = pins.i2cReadBuffer(a, 6)
    if (buf.length == 6) {
        let t_hi  = buf.getNumber(NumberFormat.UInt8LE, 0)
        let t_lo  = buf.getNumber(NumberFormat.UInt8LE, 1)
        let t_crc = buf.getNumber(NumberFormat.UInt8LE, 2)
        let t_value = (t_hi << 8) | t_lo

        let h_hi  = buf.getNumber(NumberFormat.UInt8LE, 3)
        let h_lo  = buf.getNumber(NumberFormat.UInt8LE, 4)
        let h_crc = buf.getNumber(NumberFormat.UInt8LE, 5)
        let h_value = (h_hi << 8) | h_lo

        if (crc8(t_hi, t_lo) == t_crc) { // crc ok for temperature
            t_value  = ((t_value * 175.0) / 65535) - 45 // temperature in Celsius.
            values[0] = t_value
        } else {
            serial.writeLine('CRC error: temperature reading')
            return null
        }
        if (crc8(h_hi, h_lo) == h_crc) { // crc ok for humidity
            h_value =  ((h_value * 100.0) / 65535) // relative humidity
            values[1] = h_value
        } else {
            serial.writeLine('CRC error: humidity reading')
            return null
        } 
        return values
    } else {
        serial.writeLine('I2c read error' )
    }
    return null
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
        let v = read_data(i2c_addr)
        if (v != null) {
            let t = v[0], h = v[1]
            serial.writeLine( 'temperature: ' + toFixedString(t,2) )
            serial.writeLine( 'humidity: ' + toFixedString(h,2) )
        }
        basic.pause(1000)
    }
})
///////////////////////////////////////////////////////////////////
