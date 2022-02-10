import { SerialDeviceController } from "./SerialDeviceController";

test('Retreiving serial ports', async () => {
    const ports = await SerialDeviceController.listPorts();
    expect(ports).toEqual(expect.arrayContaining([{path: '/dev/ttyS4'}]))
    return 
});