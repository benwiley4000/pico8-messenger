function writeToGpio(gpio, num, pinIndex, bits) {
  writeToGpioUnsigned(gpio, num + (1 << (bits - 1)), pinIndex, bits);
}

function writeToGpioUnsigned(gpio, num, pinIndex, bits) {
  var lastBitIndex = pinIndex + bits - 1;
  var mask = 1;
  for (var i = 0; i < bits; i++) {
    var bit = (num & mask) >> i;
    gpio[lastBitIndex - i] = bit * 255;
    mask = mask << 1;
  }
}

function readFromGpio(gpio, pinIndex, bits) {
  return readFromGpioUnsigned(gpio, pinIndex, bits) - (1 << (bits - 1));
}

function readFromGpioUnsigned(gpio, pinIndex, bits) {
  var num = 0;
  for (var i = 0; i < bits; i++) {
    num += gpio[pinIndex + i] ? (1 << (bits - 1 - i)) : 0;
  }
  return num;
}

if (typeof module !== 'undefined' && module) {
  module.exports = {
    writeToGpio: writeToGpio,
    writeToGpioUnsigned: writeToGpioUnsigned,
    readFromGpio: readFromGpio,
    readFromGpioUnsigned: readFromGpioUnsigned
  };
}
