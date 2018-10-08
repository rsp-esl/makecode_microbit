
////////////////////////////////////////////////
// tm1637_test
// Date: 2018-10-08
////////////////////////////////////////////////


let disp: CustomDisplay.TM1637 = null
let cnt: number
cnt = 0
disp = CustomDisplay.createDisplay(DigitalPin.P0, DigitalPin.P1)
for (let i = 0; i <= 4 - 1; i++) {
    disp.digit(CustomDisplay.NO_SHOW, i, true)
}
basic.pause(2000)
disp.show(8888)
for (let j = 0; j <= 10 - 1; j++) {
    disp.brightness( (j%2 == 0) ? 0 : 7)
    basic.pause(500)
}
basic.forever(() => {
    disp.show(cnt)
    cnt = (cnt + 1) % 10000
    basic.pause(100)
})

////////////////////////////////////////////////
