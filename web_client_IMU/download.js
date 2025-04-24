function downloadCSV(){
    var tempData = "timestampPeripheral, timestampCentral, packetID, subject, ax, ay, az, gx, gy, gz\r\n";
    let subjectID = document.getElementsByName('subjectTextView')[0].value;
    console.log(MotionDataArray.length);
  
    for(var i=0; i<MotionDataArray.length; i++){
      tempData += MotionDataArray[i].timestampPeripheral + "," + MotionDataArray[i].timestampCentral + "," + MotionDataArray[i].packetID + "," + subjectID + "," +
                  MotionDataArray[i].imuData.ax + "," + MotionDataArray[i].imuData.ay + "," + MotionDataArray[i].imuData.az + "," +
                  MotionDataArray[i].imuData.gx + "," + MotionDataArray[i].imuData.gy + "," + MotionDataArray[i].imuData.gz + "\r\n";
    }
  
    var downloadLink = document.createElement("a");
    var blob = new Blob([tempData], { type: "text/csv;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    downloadLink.href = url;
    downloadLink.download = subjectID + ".csv";
  
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}