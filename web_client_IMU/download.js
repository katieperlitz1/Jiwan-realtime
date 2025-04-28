// function downloadCSV(){
//     var tempData = "timestampPeripheral, timestampCentral, packetID, subject, ax, ay, az, gx, gy, gz\r\n";
//     let subjectID = document.getElementsByName('subjectTextView')[0].value;
//     console.log(MotionDataArray.length);
  
//     for(var i=0; i<MotionDataArray.length; i++){
//       tempData += MotionDataArray[i].timestampPeripheral + "," + MotionDataArray[i].timestampCentral + "," + MotionDataArray[i].packetID + "," + subjectID + "," +
//                   MotionDataArray[i].imuData.ax + "," + MotionDataArray[i].imuData.ay + "," + MotionDataArray[i].imuData.az + "," +
//                   MotionDataArray[i].imuData.gx + "," + MotionDataArray[i].imuData.gy + "," + MotionDataArray[i].imuData.gz + "\r\n";
//     }
  
//     var downloadLink = document.createElement("a");
//     var blob = new Blob([tempData], { type: "text/csv;charset=utf-8" });
//     var url = URL.createObjectURL(blob);
//     downloadLink.href = url;
//     downloadLink.download = subjectID + ".csv";
  
//     document.body.appendChild(downloadLink);
//     downloadLink.click();
//     document.body.removeChild(downloadLink);
// }

function downloadCSV() {
  if (recordedData.length === 0) {
    alert("No data recorded yet!");
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,";

  // Create CSV header
  let header = ["timestamp"];
  for (let i = 0; i < numChannels; i++) {
    header.push(channelLabels[i] || `Ch${i + 1}`);
  }
  csvContent += header.join(",") + "\r\n";

  // Add data rows
  recordedData.forEach(entry => {
    let row = [entry.timestamp, ...entry.values];
    csvContent += row.join(",") + "\r\n";
  });

  // Download
  let encodedUri = encodeURI(csvContent);
  let link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `sensor_data_${nf(hour(),2)}${nf(minute(),2)}${nf(second(),2)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}