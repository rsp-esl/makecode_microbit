//////////////////////////////////////////////////////////////////////
// IoT Engineering Education @ KMUTNB, Bangkok/Thailand
// Date: 2019-02-01
// Description: Creating a DIY air quality monitoring device.
//  Hardware components:
//   - 1x Microbit board
//   - 1x I2C (PCF8574x) LCD 16x2 display module (3.3V)
//   - 1x SDS011 PM2.5/PM10 sensor module (5V power supply, Tx/Rx 3.3V)
//   - Power supply (powerbank) with 5V output
//  Software:
//   - Coding in Microsoft MakeCode editor
//   - This Makecode project requires the I2C LCD1602 extension for Microbit.
//     => https://github.com/makecode-extensions/i2cLCD1602
//  Hardware Wiring: 
//   - Microbit pins Pin19 and Pin20 are used for SCL and SDA, respectively.
//     -> connect to Pin10 and Pin20 to the SCL and SDA pins of I2C-LCD1602
//     -> connect 3V and Gnd pins of the SDS011 module
//   - Microbit pins 0 and 1 are used for Tx and Rx, respectively.
//     -> connect Pin0 and Pin1 to the Rx and Tx pins of SDS011
//     -> provide 5V and Gnd to the SDS011 module
//////////////////////////////////////////////////////////////////////

serial.redirect(
    SerialPin.P0,  // Tx
    SerialPin.P1,  // Rx
    BaudRate.BaudRate9600
)

let mode = -1  //-1=start, 0=sensor reading, 1=data display
let state = 0
let buf: Buffer = null // read/receive buffer for serial
let data: uint8[] = [] // sensor data array
let index: number = 0  // pointer for sensor data array
let pm25 = 0
let pm10 = 0
let data_available = false
let x: int32 = 0
let checksum_ok = false

I2C_LCD1602.LcdInit(0)
I2C_LCD1602.clear()
basic.pause(2000)
I2C_LCD1602.ShowString("Microbit", 0, 0)
I2C_LCD1602.ShowString("+ SDS011 Sensor", 0, 1)
basic.pause(1000)
I2C_LCD1602.ShowString("IoT Engineering", 0, 0)
I2C_LCD1602.ShowString("Education KMUTNB", 0, 1)
basic.pause(1000)
mode = 0

basic.forever(function () {
    if (mode == 1) {
        if (data_available == true) {
            let _pm25 = pm25
            let _pm10 = pm10
            data_available = false
            if (checksum_ok) {
                basic.showIcon(IconNames.Yes)
            } else {
                basic.showIcon(IconNames.No)
            }
            I2C_LCD1602.clear()
            I2C_LCD1602.ShowString("PM25 " + Math.idiv(_pm25, 10) + '.' + _pm25 % 10 + ' ug/m3', 0, 0)
            I2C_LCD1602.ShowString("PM10 " + Math.idiv(_pm10, 10) + '.' + _pm10 % 10 + ' ug/m3', 0, 1)
            basic.pause(2000)
            if (_pm25 / 10 < 50) {
                basic.showIcon(IconNames.Happy)
            } else {
                basic.showIcon(IconNames.Sad)
            }
            basic.pause(5000)
            basic.clearScreen()
        }
        mode = 0
    } else {
        basic.pause(100)
    }
})

basic.forever(function () {
    if (mode != 0) {
        basic.pause(10)
    }
    do {
        buf = serial.readBuffer(1)
    } while (buf.length < 1)

    let b = buf.getNumber(NumberFormat.UInt8LE, 0)
    switch (state) {
        case 0:
            index = 0
            if (b == 0xaa) {
                data[index++] = b
                state = 1
            }
            break
        case 1:
            if (b == 0xc0) {
                data[index++] = b
                state = 2
            } else {
                state = 0
            }
            break
        case 2:
            data[index++] = b
            if (buf[0] == 0xab) {
                pm25 = data[3] * 256 + data[2]
                pm10 = data[5] * 256 + data[4]
                x = (data[2] + data[3] + data[4] + data[5] + data[6] + data[7]) % 256
                checksum_ok = (x == data[8])
                data_available = true
                mode = 1
                state = 0
            }
            break
        default:
            state = 0
    } // end-of-switch 
})
/////////////////////////////////////////////////////////////////

