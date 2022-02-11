//@ts-ignore
import * as chrome from "sinon-chrome/apps";
import { SerialDeviceController } from "./SerialDeviceController";

const mockListPorts = jest.fn();
jest.mock('./SerialDeviceController',() => {
    return jest.fn().mockImplementation(()=>{
        return {listPorts: mockListPorts}
    })
});


beforeAll(() => {
    global.chrome = chrome
    // SerialDeviceController.mockClear();
    mockListPorts.mockClear();
});

// beforeEach(()=>{
//     SerialDeviceController.mockClear();
// });

test('Retreiving serial ports', async () => {    
    const ports = await SerialDeviceController.listPorts();
    expect(ports).toEqual(expect.arrayContaining([{path: '/dev/ttyS4'}]))
});