function intToShort(n) {
    if (n < 32768) {
        return n; // Positive values stay the same
    } else {
        return n - 65536; // Handle two's complement for negative values
    }
}

// function for the display of the data
function keyPressed() {
  if (key=='a' || key=='A') { 
    chart = SHOW_ACC;
    console.log("Show Acc data");
  }
  else if (key=='g' || key=='G') { 
    chart = SHOW_GYR;
    console.log("Show Gyro data");
  }
}
