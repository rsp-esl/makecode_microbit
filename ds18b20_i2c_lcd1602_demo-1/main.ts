///////////////////////////////////////////////////////////////////////////
// IoT Engineering Education @ KMUTNB
// Date: 2019-02-11
// Description: Temperature Measurement using DS18B20 sensor probe
// Requirements:
//   Add the following Microbit extensions
//   1) DS18B20 OneWire temperature probe
//     -> https://github.com/DFRobot/pxt-ds18b20
//   2) I2C LCD1602 (PCF8574x)
//     -> https://github.com/makecode-extensions/i2cLCD1602
// 
// Wiring
//   I2C LCD1602: Vcc=3.3V, GND = 0V, SCL = Pin 19, SDA = Pin 20 
//   DS18B20: Vcc=3.3V, Gnd = 0V, DATA = Pin 0
//     with 4.7k or 10k Ohm pull-up between DATA pin and Vcc (3.3V)
///////////////////////////////////////////////////////////////////////////

serial.redirectToUSB()

I2C_LCD1602.LcdInit(0x3F) // 0 for auto-scan, default 0x3F (63)
I2C_LCD1602.on()
I2C_LCD1602.clear()
let temp = 0
let tempMin = 10000, tempMax = 0, tempAvg = 0
let temps: number[] = [0, 0, 0, 0]
let str1 = 'Microbit DS18B20', str2 = '   + I2C LCD1602'

I2C_LCD1602.clear()
I2C_LCD1602.ShowString(str1, 0, 0)
I2C_LCD1602.ShowString(str2, 0, 1)
basic.pause(2000)

temp = DS18B20.Temperature(DS18B20.pin.pin0)
basic.pause(1000)

for (let i = 0; i < temps.length; i++) {
    temps[i] = temp
}

function num2str(value: number) {
    let s = Math.idiv(value, 100) + '.'
        + (Math.idiv(value, 10) % 10)
    return s
}

basic.forever(function () {

    temp = DS18B20.Temperature(DS18B20.pin.pin0)
    temps.removeAt(0) // remove the first element in the array 
    temps.push(temp)  // append a new value to the array
    led.plotBarGraph(temp / 100, 40)
    serial.writeLine('' + num2str(temp))

    if (temp > tempMax) {
        tempMax = temp
    }
    if (temp < tempMin) {
        tempMin = temp
    }

    let sum = 0
    for (let i = 0; i < temps.length; i++) {
        sum += temps[i]
    }
    tempAvg = sum / temps.length

    str1 = 'Now: ' + num2str(temp) + ' deg.C'
    str2 = 'Avg: ' + num2str(tempAvg) + ' deg.C'
    I2C_LCD1602.clear()
    I2C_LCD1602.ShowString(str1, 0, 0)
    I2C_LCD1602.ShowString(str2, 0, 1)
    basic.pause(3000)

    str1 = 'Min: ' + num2str(tempMin) + ' deg.C'
    str2 = 'Max: ' + num2str(tempMax) + ' deg.C'
    I2C_LCD1602.clear()
    I2C_LCD1602.ShowString(str1, 0, 0)
    I2C_LCD1602.ShowString(str2, 0, 1)
    basic.pause(3000)
})
