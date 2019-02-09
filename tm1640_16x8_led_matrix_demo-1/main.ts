let SCK = DigitalPin.P13
let DIN = DigitalPin.P15

let TM1640_CMD_DATA = 0x40  // data command
let TM1640_CMD_ADDR = 0xC0  // address command
let TM1640_CMD_DISP = 0x80  // display control command
let TM1640_DSP_ON   = 0x08  // display on
let TM1640_FIXED    = 0x04  // fixed address mode
let intensity = 7
let buf: number[] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] // 16-byte buffer

let DIGITS_FONT: number[][] = [
    [0xfe, 0x82, 0x82, 0xfe], // 0
    [0x00, 0x82, 0xfe, 0x80], // 1
    [0xf2, 0x92, 0x92, 0x9e], // 2
    [0x92, 0x92, 0x92, 0xfe], // 3
    [0x1e, 0x10, 0x10, 0xfe], // 4
    [0x9e, 0x92, 0x92, 0xf2], // 5
    [0xfe, 0x92, 0x92, 0xf2], // 6
    [0x02, 0xe2, 0x12, 0x0e], // 7
    [0xfe, 0x92, 0x92, 0xfe], // 8
    [0x9e, 0x92, 0x92, 0xfe]  // 9
]

function tm1640_writeByte(data: number) {
    tm1640_writeBytesToAddress( data, null, 0 )
}

function tm1640_init() {
    pins.digitalWritePin(SCK, 1)
    pins.digitalWritePin(DIN, 1)
    tm1640_writeByte(TM1640_CMD_DATA); // enter command data with auto address increment
    tm1640_writeByte(TM1640_CMD_DISP | TM1640_DSP_ON | intensity); // set brightness and turn display on
}

function tm1640_clear_buf() {
    for (let i = 0; i < buf.length; i++) {
        buf[i] = 0
    }
}

function tm1640_setBrightness(level: number) {
    if (level >= 8) {
        intensity = 7;
    } else {
        intensity = level;
    }
    tm1640_writeByte(TM1640_CMD_DISP | TM1640_DSP_ON | intensity); // set brightness and turn display on
}

function tm1640_writeBytesToAddress(
    addr: number,
    data: number[],
    num_bytes: number) {

    addr = TM1640_CMD_ADDR | (addr & 0x0f);

    // Start condition
    pins.digitalWritePin(SCK, 1)
    pins.digitalWritePin(DIN, 0)

    // Write address byte
    for (let i = 0; i < 8; i++) {
        pins.digitalWritePin(SCK, 0)
        control.waitMicros(4)
        pins.digitalWritePin(DIN, (addr & 1));
        pins.digitalWritePin(SCK, 1)
        control.waitMicros(4)
        addr = addr >> 1;
    }
	
	if ( num_bytes > 0 ) {
       // Write data byte(s)
        for (let k = 0; k < num_bytes; k++) {
            let _data = data[num_bytes - k - 1];
            for (let i = 0; i < 8; i++) {
                pins.digitalWritePin(SCK, 0)
                control.waitMicros(4)
                pins.digitalWritePin(DIN, (_data & 0x80) >> 7);
                pins.digitalWritePin(SCK, 1);
                control.waitMicros(4)
                _data = _data << 1;
            }
        }
	}
    // Stop condition
    pins.digitalWritePin(SCK, 0)
    pins.digitalWritePin(DIN, 0)
    pins.digitalWritePin(SCK, 1)
    pins.digitalWritePin(DIN, 1)
    control.waitMicros(4)
}

control.inBackground(function () {
    let cnt = 0
    let digits: number[] = [0, 0, 0]

    tm1640_init()
	
    while (true) {
        tm1640_clear_buf()
        for (let i = 0; i < 3; i++) { // 3 number digits
            let data = DIGITS_FONT[digits[i]];
            for (let j = 0; j < 4; j++) { // 4 pixels font width
                buf[1 + ((1 + 4) * i) + j] = data[j]
            }
        }
        tm1640_writeBytesToAddress(0, buf, 16)
		
        basic.pause(100)
		
        cnt = (cnt + 1) % 1000
        digits[0] = Math.idiv(cnt, 100) % 10
        digits[1] = Math.idiv(cnt, 10)  % 10
        digits[2] = cnt % 10

    }
})
///////////////////////////////////////////////////////
