﻿////////////////////////////////////////////////
// hc_sr04_test-2
// Date: 2018-10-08
////////////////////////////////////////////////

let sound_speed = 0
let distance = 0
let waiting_for_pulse = false
let duration_usec = 0
const echo_pin = DigitalPin.P0;
const trig_pin = DigitalPin.P1;
sound_speed = 340

pins.digitalWritePin(trig_pin, 0);
basic.pause(1000)

serial.writeLine("\r\nUltrasonic Sensor\r\n")
pins.onPulsed(echo_pin, PulseValue.High, () => {
    duration_usec = pins.pulseDuration();
})
basic.forever(() => {
    if (waiting_for_pulse == false) {
        waiting_for_pulse = true
        pins.digitalWritePin(trig_pin, 1);
        control.waitMicros(40)
        pins.digitalWritePin(trig_pin, 0);
        basic.pause(200)
    } else {
        if (duration_usec <= 20000) {
            distance = (duration_usec / 2) * sound_speed / 1000
            serial.writeLine("Duration (usec) : " + duration_usec)
            serial.writeLine("Distance (cm)   : " + distance / 10 + "." + distance % 10)
        } else {
            serial.writeLine("Invalid Range! ")
        }
        duration_usec = 0
        waiting_for_pulse = false
        serial.writeLine("")
        basic.pause(500)
    }
})

////////////////////////////////////////////////
