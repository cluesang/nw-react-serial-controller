//@ts-ignore
import * as chrome from "sinon-chrome/apps";
import { SerialDeviceController } from "./SerialDeviceController";


beforeAll(() => {
    global.chrome = chrome
});

test('Retreiving serial ports', async () => {    
    const ports = await SerialDeviceController.listPorts();
    // console.log(ports);
    expect(ports).toEqual(expect.arrayContaining([{path: '/dev/ttyS4'}]))
});