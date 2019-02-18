////////////////////////////////////////////////////////////
// IoT Engineering Education @ KMUTNB
// Date: 2019-02-17
// Description:
//    Read temperature and humidity values from DHT22 
//    sensor module(s).
//
////////////////////////////////////////////////////////////
// Based on code available at:
//  - https://github.com/DoraLC/pxt-DHT22/blob/master/main.ts
//  - https://github.com/MonadnockSystems/pxt-dht11/blob/master/main.ts
////////////////////////////////////////////////////////////

let dht_err_code = 0

function dht22_read(pin: DigitalPin): number[] {
    let cnt = 0
    let values: number[] = [0, 0]
    let t = 0, h = 0, c = 0
    let t0 = 0, t1 = 0, dt = 0
    pins.setPull(pin, PinPullMode.PullNone)
    pins.digitalWritePin(pin, 0)
    basic.pause(5)
    let x = pins.digitalReadPin(pin)
    pins.setPull(pin, PinPullMode.PullUp)

    cnt = 0; dht_err_code = 100
    while (pins.digitalReadPin(pin) == 1) { 
        if (cnt++ > 5) return null
    }
    cnt = 0; dht_err_code = 200
    while (pins.digitalReadPin(pin) == 0) {
        if (cnt++ > 5) return null
    }
    cnt = 0; dht_err_code = 300
    while (pins.digitalReadPin(pin) == 1) {
        if (cnt++ > 5) return null
    }

    for (let i = 0; i < 40; i++) {
        cnt = 0; dht_err_code = 400
        while (pins.digitalReadPin(pin) == 0) {
            if (cnt++ > 5) return null
        }
        cnt = 0; dht_err_code = 500+i
        while ( pins.digitalReadPin(pin) == 1 ) {            
            if (cnt++ > 10) {
                return null
            }
        }
        if ( cnt > 2 ) {   
            if (i < 16) {
                h |= (1 << (15 - i))
            }
            else if (i < 32) {
                t |= (1 << (31 - i))
            }
            else {
                c |= (1 << (39 - i))
            }
        }
    }

    let checksum = 0
    checksum += (h >> 8) & 0xff
    checksum += h & 0xff
    checksum += (t >> 8) & 0xff
    checksum += t & 0xff
    if (checksum != c) {
        dht_err_code = 600
        serial.writeLine('checksum error')
        return null
    }
    values[0] = t
    values[1] = h
    dht_err_code = 0
    return values
}

serial.writeLine('DHT22 reading...')

let dht22_pins: DigitalPin[] = [DigitalPin.P0, DigitalPin.P1]

basic.forever(function () {
    dht22_pins.forEach(function(pin, i) {
        let v = dht22_read(pin)
        if (v != null) {
            let s : string
            let t = v[0], h = v[1]
            s = 'DHT22 #' + (i+1)
            s += ', temperature: ' + Math.idiv(t, 10)
            s += '.' + Math.abs(t % 10)
            s += ' deg.C'
            s += ', humidity: ' + Math.idiv(h, 10)
            s += '.' + Math.abs( h%10 )
            s += ' %RH'
            serial.writeLine(s)
        } else {
            serial.writeLine('error: ' + dht_err_code )
            basic.pause(1000)
        }
    })
    basic.pause(1000)
})

////////////////////////////////////////////////////////////
