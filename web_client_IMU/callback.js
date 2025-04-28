// /*
//  * Connect to a device by passing the service UUID, and handler for response (a list of characteristics)
//  */

// function bleConnect() {
//     if (!isConnected) {
//         // Connect to a device by passing the service UUID
//         myBLE.connect(serviceUUID, "XIAO", gotCharacteristics);
//         // myBLE.connect(serviceUUID, null, gotCharacteristics);
//         connectBtn.elt.textContent = 'Disconnect Device';
//         console.log("Connecting to myBLE Device...");
//     } else {
//         myBLE.disconnect();
//         isConnected = myBLE.isConnected(); // Check if myBLE is connected
//         connectBtn.elt.textContent = 'Connect Device';
//         console.log("Disconnecting from myBLE Device...");
//     }
// }


// // A function that will be called once got characteristics
// function handleNotifications(data) {
//     // Assuming `data` is a Uint8Array or Buffer
//     // const label = String.fromCharCode(data.getUint8(0));
//     const timeNow = millis();
//     const label = data.getUint8(0)+1;
//     // console.log('Label: ', label, ', Length: ', data.byteLength);

//     // Extract timestamp (Next 4 bytes)
//     const timestampPeripheral = (data.getUint8(1) << 24) | (data.getUint8(2) << 16) | 
//                 (data.getUint8(3) << 8) | data.getUint8(4);
    
//     const timestampCentral = timeNow;

//     // Extract IMU data (Next 12 bytes, indices 5 to 16)
//     imu_temp = {
//         ax: intToShort((data.getUint8(5) << 8) | data.getUint8(6)),
//         ay: intToShort((data.getUint8(7) << 8) | data.getUint8(8)),
//         az: intToShort((data.getUint8(9) << 8) | data.getUint8(10)),
//         gx: intToShort((data.getUint8(11) << 8) | data.getUint8(12)),
//         gy: intToShort((data.getUint8(13) << 8) | data.getUint8(14)),
//         gz: intToShort((data.getUint8(15) << 8) | data.getUint8(16))
//     };

//     // console.log('IMU Data: ', imu_temp);
//     acc_x = imu_temp.ax;
//     acc_y = imu_temp.ay;
//     acc_z = imu_temp.az;
//     gyr_x = imu_temp.gx;
//     gyr_y = imu_temp.gy;
//     gyr_z = imu_temp.gz;

//     // Save the data to an object (you can modify this as needed for your use case)
//     const IMUData = {
//         timestampPeripheral: timestampPeripheral,
//         timestampCentral: timestampCentral,
//         packetID: label,
//         imuData: imu_temp,
//     };

//     // For example, save to a file or store in an array (assuming `dataArray` is used to store this)
//     if (isRecording) {
//         MotionDataArray.push(IMUData);
//         // console.log('Data saved at ', IMUData.timestampPeripheral, ", ", IMUData.timestampCentral);
//     }
// }

// // A function that will be called once got characteristics
// function gotCharacteristics(error, characteristics) {
//     if (error) {console.log('ERROR: ', error); return;}  // log the problem
//     else if (characteristics==null || characteristics.length==0) {console.log('ERROR: no characteristics. Probably user cancelled connect request.'); return;}  // log the problem    
//     else {
//         console.log('BLE device connected.');
//         console.log('Characteristics: ', characteristics); // log the list of characterisitcs.
//     }

//     isConnected = myBLE.isConnected();
//     for(let i = 0; i < characteristics.length; i++){
//      if(rxCharacteristic ==characteristics[i].uuid){
//       myCharacteristic = characteristics[i];
//       myBLE.startNotifications(myCharacteristic, handleNotifications, 'custom');
//      } else {
//       console.log('characteristic error: ', characteristics[i].uuid)
//      }
//     }
//   }

/*
 * Connect to a device by passing the service UUID, and handler for response (a list of characteristics)
 */

// function bleConnect() {
//     if (!isConnected) {
//         // Connect to a device by passing the service UUID
//         myBLE.connect(serviceUUID, "Seams-test", gotCharacteristics);
//         // myBLE.connect(serviceUUID, null, gotCharacteristics);
//         connectBtn.elt.textContent = 'Disconnect Device';
//         console.log("Connecting to myBLE Device...");
//     } else {
//         myBLE.disconnect();
//         isConnected = myBLE.isConnected(); // Check if myBLE is connected
//         connectBtn.elt.textContent = 'Connect Device';
//         console.log("Disconnecting from myBLE Device...");
//     }
// }


// // A function that will be called once got characteristics
// function handleNotifications(data) {
//     // If `data` is a DataView or similar:
//     analog_temp = {
//         ch1: data.getUint32(0, true),
//         ch2: data.getUint32(4, true),
//         ch3: data.getUint32(8, true),
//         ch4: data.getUint32(12, true),
//         ch5: data.getUint32(16, true),
//         ch6: data.getUint32(20, true),
//         ch7: data.getUint32(24, true),
//         ch8: data.getUint32(28, true),
//     };

//     ch1 = analog_temp.ch1;
//     ch2 = analog_temp.ch2;
//     ch3 = analog_temp.ch3;
//     ch4 = analog_temp.ch4;
//     ch5 = analog_temp.ch5;
//     ch6 = analog_temp.ch6;
//     ch7 = analog_temp.ch7;
//     ch8 = analog_temp.ch8;

//     console.log(analog_temp);

//     // No label, no timestamp
//     if (isRecording) {
//         MotionDataArray.push({
//             timestampCentral: millis(),
//             imuData: analog_temp,
//         });
//     }
// }

// // A function that will be called once got characteristics
// function gotCharacteristics(error, characteristics) {
//     if (error) {console.log('ERROR: ', error); return;}  // log the problem
//     else if (characteristics==null || characteristics.length==0) {console.log('ERROR: no characteristics. Probably user cancelled connect request.'); return;}  // log the problem    
//     else {
//         console.log('BLE device connected.');
//         console.log('Characteristics: ', characteristics); // log the list of characterisitcs.
//     }

//     isConnected = myBLE.isConnected();
//     for(let i = 0; i < characteristics.length; i++){
//      if(rxCharacteristic ==characteristics[i].uuid){
//       myCharacteristic = characteristics[i];
//       myBLE.startNotifications(myCharacteristic, handleNotifications, 'custom');
//      } else {
//       console.log('characteristic error: ', characteristics[i].uuid)
//      }
//     }
//   }



// Global variables
let mode = 'IMU'; // Default mode
let handleNotifications = handleNotificationsIMU; // Default handler

// BLE Connect/Disconnect
function bleConnect() {
    if (!isConnected) {
        myBLE.connect(serviceUUID, "Seams-test", gotCharacteristics);
        connectBtn.elt.textContent = 'Disconnect Device';
        console.log("Connecting to myBLE Device...");
    } else {
        myBLE.disconnect();
        isConnected = myBLE.isConnected();
        connectBtn.elt.textContent = 'Connect Device';
        console.log("Disconnecting from myBLE Device...");
    }
}

// Called once we got characteristics
function gotCharacteristics(error, characteristics) {
    if (error) {
        console.log('ERROR:', error);
        return;
    } else if (!characteristics || characteristics.length === 0) {
        console.log('ERROR: No characteristics. Probably user cancelled connect request.');
        return;
    }

    console.log('BLE device connected.');
    console.log('Characteristics:', characteristics);

    isConnected = myBLE.isConnected();
    for (let i = 0; i < characteristics.length; i++) {
        if (rxCharacteristic == characteristics[i].uuid) {
            myCharacteristic = characteristics[i];
            myBLE.startNotifications(myCharacteristic, handleNotifications, 'custom');
        } else {
            console.log('Characteristic error:', characteristics[i].uuid);
        }
    }
}

// =========== Notification Handlers =========== //

// For IMU mode
function handleNotificationsIMU(data) {
    const timeNow = millis();
    const label = data.getUint8(0) + 1;

    const timestampPeripheral = (data.getUint8(1) << 24) | (data.getUint8(2) << 16) |
                                 (data.getUint8(3) << 8) | data.getUint8(4);
    const timestampCentral = timeNow;

    imu_temp = {
        ax: intToShort((data.getUint8(5) << 8) | data.getUint8(6)),
        ay: intToShort((data.getUint8(7) << 8) | data.getUint8(8)),
        az: intToShort((data.getUint8(9) << 8) | data.getUint8(10)),
        gx: intToShort((data.getUint8(11) << 8) | data.getUint8(12)),
        gy: intToShort((data.getUint8(13) << 8) | data.getUint8(14)),
        gz: intToShort((data.getUint8(15) << 8) | data.getUint8(16))
    };

    acc_x = imu_temp.ax;
    acc_y = imu_temp.ay;
    acc_z = imu_temp.az;
    gyr_x = imu_temp.gx;
    gyr_y = imu_temp.gy;
    gyr_z = imu_temp.gz;

    const IMUData = {
        timestampPeripheral: timestampPeripheral,
        timestampCentral: timestampCentral,
        packetID: label,
        imuData: imu_temp,
    };

    if (isRecording) {
        MotionDataArray.push(IMUData);
    }
}

// For Analog mode
function handleNotificationsAnalog(data) {
    analog_temp = {
        ch1: data.getUint32(0, true),
        ch2: data.getUint32(4, true),
        ch3: data.getUint32(8, true),
        ch4: data.getUint32(12, true),
        ch5: data.getUint32(16, true),
        ch6: data.getUint32(20, true),
        ch7: data.getUint32(24, true),
        ch8: data.getUint32(28, true),
    };

    ch1 = analog_temp.ch1;
    ch2 = analog_temp.ch2;
    ch3 = analog_temp.ch3;
    ch4 = analog_temp.ch4;
    ch5 = analog_temp.ch5;
    ch6 = analog_temp.ch6;
    ch7 = analog_temp.ch7;
    ch8 = analog_temp.ch8;

    console.log(analog_temp);

    if (isRecording) {
        MotionDataArray.push({
            timestampCentral: millis(),
            imuData: analog_temp,
        });
    }
}


function updateNotificationHandler() {
    restartNotifications();
}


async function restartNotifications() {
    if (!isConnected || !myCharacteristic) {
        console.log("Device not connected or characteristic not available.");
        return;
    }

    try {
        await myBLE.stopNotifications(myCharacteristic);
        console.log("Notifications stopped successfully.");
    } catch (error) {
        console.log("Error stopping notifications (ignore if harmless):", error);
    }

    let selectedMode = modeDropdown.value();
    if (selectedMode === "IMU") {
        handleNotifications = handleNotificationsIMU;
        console.log("Restarting IMU Notifications...");
    } else if (selectedMode === "Analog") {
        handleNotifications = handleNotificationsAnalog;
        console.log("Restarting Analog Notifications...");
    } else {
        console.log("Unknown mode selected. Cannot restart notifications.");
        return;
    }

    await myBLE.startNotifications(myCharacteristic, handleNotifications, 'custom');
}
