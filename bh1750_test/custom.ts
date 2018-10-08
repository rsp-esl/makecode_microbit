/**
 * Custom blocks for BH1750 Light Sensor
 * MIT License
 * Date: 2018-10-07
 * IoT Engineering Education
 * Facebook: https://www.facebook.com/iot.kmutnb
 */

//% weight=100 color=#0fbc11 icon=""
namespace CustomSensors {
    const BH1750_CONTINUOUS_HIGH_RES_MODE = 0x10;
    const BH1750_I2C_ADDR = 0x23;

    export class BH1750 {
        addr: number

        begin(address: number) {
            this.addr = address
            pins.i2cWriteNumber(this.addr, BH1750_CONTINUOUS_HIGH_RES_MODE, NumberFormat.UInt8BE)
            basic.pause(120)
        }

        //% blockId="bh1750_address" block="%strip|set I2C address|%address|"
        //% advanced=false 
        setAddress(address: number): void {
            this.addr = address
        }

        //% blockId="bh1750_intensity" block="%strip|get intensity (lx)"
        //% advanced=false
        getIntensity(): number {
            let value = pins.i2cReadNumber(this.addr, NumberFormat.UInt16BE);
            return Math.floor((5 * value) / 6);
        }
    } // end class

    //% blockId=bh1750_create block="create BH1750 at|%address"
    export function createBH1750(address: number): BH1750 {
        let bh1750 = new BH1750()
        bh1750.begin(address)
        return bh1750
    }

} // end namespace

/////////////////////////////////////////////////////////////////////
