////////////////////////////////////////////////////////////////
// IoT Engineering Education @ KMUTNB
// Date: 2019-02-12
// Hardware: 
//  - Microbit
//  - BME280 temperature, humidity and pressure sensor module
//  - BH1750 ambient light sensor module 
//  - 16x2 LCD module with PCF8574x adapter 
//
// Please use the online MakeCode editor to search and 
// add the following extensions before compiling this code:
//  - LCD1602 (I2C)
//  - BH1750 (I2C)
//  - BME280 (I2C)
// 
// Circuit Wiring:
//  - Connect 3.3V and GND pins on the Microbit board 
//    to Vcc and GND pins of the three modules, respectively.
//  - Connect Pin 19 and Pin 20 on the Microbit board to
//    the SCL and SDA pins of the three modules, respectively.
////////////////////////////////////////////////////////////////

serial.redirectToUSB()

I2C_LCD1602.LcdInit(0x3F) // use default address for PCF8574 (PCF8574T)
I2C_LCD1602.BacklightOn()
I2C_LCD1602.clear()

BME280.Address(0x76) // use default address for BME280
BME280.PowerOn()

BH1750.SetAddress(BH1750_ADDRESS.A35) // use default address for BH1750
BH1750.on()

let tp = 0, hd = 0, pr = 0, lx = 0
let str1 = '', str2 = ''
let spaces = '        '

basic.forever(function () {
    basic.showIcon(IconNames.Heart) // show heart beat
    tp = Math.round(10 * BME280.temperature())
    hd = Math.round(10 * BME280.humidity())
    pr = Math.round(BME280.pressure() / 10)
    lx = BH1750.getIntensity()
    basic.clearScreen()

    str1 = 'Temp. [deg.C]:'
    str2 = '' + Math.idiv(tp, 10) + '.' + (tp % 10)
    serial.writeLine(str1 + ' ' + str2)
    str2 = spaces.substr(0, (16 - str2.length) / 2) + str2
    I2C_LCD1602.clear()
    I2C_LCD1602.ShowString(str1, 0, 0)
    I2C_LCD1602.ShowString(str2, 0, 1)
    basic.pause(2000)

    str1 = 'Humidity [%RH]:'
    str2 = '' + Math.idiv(hd, 10) + '.' + (hd % 10)
    serial.writeLine(str1 + ' ' + str2)
    str2 = spaces.substr(0, (16 - str2.length) / 2) + str2
    I2C_LCD1602.clear()
    I2C_LCD1602.ShowString(str1, 0, 0)
    I2C_LCD1602.ShowString(str2, 0, 1)
    basic.pause(2000)

    str1 = 'Pressure [hPa]:'
    str2 = '' + Math.idiv(pr, 10) + '.' + (pr % 10)
    serial.writeLine(str1 + ' ' + str2)
    str2 = spaces.substr(0, (16 - str2.length) / 2) + str2
    I2C_LCD1602.clear()
    I2C_LCD1602.ShowString(str1, 0, 0)
    I2C_LCD1602.ShowString(str2, 0, 1)
    basic.pause(2000)

    str1 = 'Light [Lux]:'
    str2 = '' + lx
    serial.writeLine(str1 + ' ' + str2)
    str2 = spaces.substr(0, (16 - str2.length) / 2) + str2
    I2C_LCD1602.clear()
    I2C_LCD1602.ShowString(str1, 0, 0)
    I2C_LCD1602.ShowString(str2, 0, 1)
    basic.pause(2000)
})


