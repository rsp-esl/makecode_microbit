////////////////////////////////////////////////
// hc_sr04_test-1
// Date: 2018-10-08
////////////////////////////////////////////////

let distance = 0
let sound_speed = 0
let duration_usec = 0
sound_speed = 340
const echo_pin = DigitalPin.P0;
const trig_pin = DigitalPin.P1;

pins.digitalWritePin(trig_pin, 0);
basic.pause(1000)
serial.writeLine("\r\nUltrasonic Sensor\r\n")

basic.forever(() => {
    pins.digitalWritePin(trig_pin, 1);
    control.waitMicros(20)
    pins.digitalWritePin(trig_pin, 0);
    duration_usec = pins.pulseIn(echo_pin, PulseValue.High, 20000);
    if (duration_usec <= 20000) {
        distance = (duration_usec / 2) * sound_speed / 1000
        serial.writeLine("Duration (usec) : " + duration_usec)
        serial.writeLine("Distance (cm)   : " +
            (distance / 10) + '.' + (distance % 10))
    } else {
        serial.writeLine("Invalid Range!")
    }
    basic.pause(500)
})

////////////////////////////////////////////////
