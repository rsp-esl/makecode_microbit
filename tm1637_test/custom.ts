/**
 * Custom blocks for TM1637 Display
 * MIT License
 * Date: 2018-10-07
 * IoT Engineering Education
 * Facebook: https://www.facebook.com/iot.kmutnb
 */

//% weight=100 color=#0fbc11 icon=""
namespace CustomDisplay {

    const TABLE_7SEG: number[] = [ // 0,1,2,...,9,A,B,C,D,E,F
        0x3f, 0x06, 0x5b, 0x4f, 0x66, 0x6d, 0x7d, 0x07,
        0x7f, 0x6f, 0x77, 0x7c, 0x39, 0x5e, 0x79, 0x71
    ];   

    export const NO_SHOW: number = 0x7f;

    export class TM1637 {
        clkPin: DigitalPin;
        dioPin: DigitalPin;
        brightnessLevel: number;
        buf: Buffer;

        private sendByte(data: number) {
            for (let i = 0; i < 8; i++) {
                pins.digitalWritePin(this.clkPin, 0);
                pins.digitalWritePin(this.dioPin, data & 0x01);
                data >>= 1;
                pins.digitalWritePin(this.clkPin, 1);
            }
            pins.digitalWritePin(this.clkPin, 0);
            let ack = pins.digitalReadPin(this.dioPin); // read ACK bit
            pins.digitalWritePin(this.dioPin, 1);
            pins.digitalWritePin(this.clkPin, 1);
        }

        private start() {
            pins.digitalWritePin(this.clkPin, 1);
            pins.digitalWritePin(this.dioPin, 1);
            pins.digitalWritePin(this.dioPin, 0);
            pins.digitalWritePin(this.clkPin, 0);
        }

        private stop() {
            pins.digitalWritePin(this.clkPin, 0);
            pins.digitalWritePin(this.dioPin, 0);
            pins.digitalWritePin(this.clkPin, 1);
            pins.digitalWritePin(this.dioPin, 1);
        }

        private decode(data: number): number {
            if (data == NO_SHOW) {
                data = 0x00;
            } else {
                data = TABLE_7SEG[data];
            }
            return data;
        }

        //% blockId=tm1637_digit block="%strip|show a value|%value|at digit|%pos| show dot|%dot"
        //% value.min=0 value.max=9
        //% pos.min=0 pos.max=3
        //% advanced=false
        digit(value: number, pos: number, dot: boolean ) {
            if ((value == NO_SHOW) || ((value <= 9) && (pos <= 3))) {
                let data = this.decode(value);
                // send command
                this.start();
                this.sendByte(0x40);
                this.stop();
                // send data
                this.start();
                this.sendByte( 0xC0 | pos );
                if ( dot ) { data |= 0x80; }
                this.sendByte( data );
                this.stop();
            }
        }
        //% blockId=tm1637_value block="%strip|show number|%value"
        //% value.min=0 value.max=9999
        //% advanced=false
        show(value: number) {
            if ( value < 0 ) return;
            for ( let i=0; i < 4; i++) {
                this.buf[3-i] = value % 10;
                value = value / 10;
            }
            // send command
            this.start();
            this.sendByte(0x40);
            this.stop();
            // send data
            this.start();
            this.sendByte(0xC0);
            for ( let i=0; i < 4; i++) { 
               this.sendByte( this.decode( this.buf[i] ) );
            }
            this.stop();
        }

        //% blockId=tm1637_brightness block="%strip|set brightness level|%level"
        //% level.min=0 level.max=7
        //% advanced=false
        brightness( level: number ) {
            this.brightnessLevel = level & 0x7;
            this.start();
            this.sendByte(0x88 + this.brightnessLevel);
            this.stop();
        }

        //% blockId=tm1637_clear block="%strip|clear"
        //% advanced=false
        clear() {
            for ( let i=0; i < 4; i++) {
              this.digit( NO_SHOW, i, false );
            }
        }
    } // end class


    //% blockId=tm1637_create block="4-Digit Display at CLK pin|%clkPin|and DIO pin |%dioPin"
    export function createDisplay(clkPin: DigitalPin, dioPin: DigitalPin): TM1637 {
        let disp = new TM1637();
        disp.buf = pins.createBuffer(4); // create 4-byte buffer
        disp.clkPin = clkPin;      // set clk pin for TM1637
        disp.dioPin = dioPin;      // set data pin for TM1637
        disp.clear();              // clear display
        disp.brightness(7);        // set brightness level: 0..7
        return disp;
    }

} // end namespace

/////////////////////////////////////////////////////////////////////
