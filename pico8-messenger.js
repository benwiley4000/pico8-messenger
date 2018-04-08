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
  return gpio
    .slice(pinIndex, pinIndex + bits)
    .reduce(function (num, val, i) {
      return num + (
        val
          ? Math.pow(2, bits - 1 - i)
          : 0
      );
    }, 0);
}

if (typeof module !== 'undefined' && module) {
  module.exports = {
    writeToGpio: writeToGpio,
    writeToGpioUnsigned: writeToGpioUnsigned,
    readFromGpio: readFromGpio,
    readFromGpioUnsigned: readFromGpioUnsigned
  };
}
