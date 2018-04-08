# pico8-messenger

Utility functions for passing numbers between your [PICO-8](https://www.lexaloffle.com/pico-8.php) game and outside environments/devices, via PICO-8's GPIO interface.

## usage

In PICO-8:

```lua
-- write the number 7 (needs 3 bits),
-- starting at GPIO pin 4
write_gpio_unsigned(7, 4, 3)
```

Then, in the browser:

```javascript
// log the number encompassing 3 bits,
// starting at GPIO pin 4
console.log(readFromGpioUnsigned(4, 3)); // 7
```

## why

PICO-8 has a GPIO interface supporting 128 pins, each of which can store a 128-bit unsigned integer (0-255). However Raspberry PI and CHIP only support consuming each GPIO pin as a single bit (0 or 255), and only have pins for a small subset of the 128 virtual slots. The Pocket CHIP only has 6 fully-exposed pins (indices 1-6).

This means that if you want to pass GPIO information that can be used easily with any platform that runs PICO-8, you only get six on-and-off slots, which doesn't sound that great. Until you consider that you can still use those 6 slots to encode an integer up to 6 bits (-32 to 31 signed, or 0 to 63 unsigned!). Even a 3-bit int (0-7 unsigned) can often be enough to encode meaningful state information for many games, which can be used to trigger vibrations, color lights, etc.

The trouble is, taking a decimal value and encoding it as binary with PICO-8's built-in GPIO functions, then reading it again later, is not simple. GPIO Messenger provides utility functions which abstract away the bit-shifting and let you just read and write numbers.

## including in pico-8

Copy the functions you need from pico8-messenger.lua into your .p8 file.

```lua
-- included definition for write_gpio
-- included definition for read_gpio

-- write the number -1 to bits 1 through 3
write_gpio(-1, 1, 3)

-- print out the number stored in bits 4 through 6
print(read_gpio(4, 3), 8, 8, 7)
```

## including via script tag

You can download pico8-messenger.js and include it in your page with a script tag:

```html
<script src="pico8-messenger.js"></script>
<script>
  pico8_gpio = pico8_gpio || Array(128);

  // get some number stored in bits 1 through 3
  var numFromPico8 = readFromGpio(pico8_gpio, 1, 3);

  // send the number 2 to pico-8 stored in bits 4 through 6
  writeToGpio(pico8_gpio, 2, 4, 3);
</script>
```

Or if you prefer to fetch it from a CDN:

```html
<script src="https://unpkg.com/pico8-messenger"></script>
```

(It's better to specify a specific version string rather than letting unpkg serve you the latest version each time the page is fetched; try opening https://unpkg.com/pico8-messenger in a web browser first so it resolves to a more specific URL, then include that as your script `src`.)

## installing as a module

You can also install from npm:

```console
npm install --save pico8-messenger
```

And use like this:

```js
var p8messenger = require('pico8-messenger');

window.pico8_gpio = window.pico8_gpio || Array(128);

// get some number stored in bits 1 through 3
var numFromPico8 = readFromGpio(pico8_gpio, 1, 3);

// send the number 6 to pico-8 stored in bits 4 through 6
writeToGpio(pico8_gpio, 6, 4, 3);
```

## API

For all of these functions:
* `num` is the decimal integer to be stored
* `pin_index` or `pinIndex` is index in the GPIO array (0-127) where storage for this number should begin (in other words, the location of the largest, left-most bit)
* `bits` is the number of bits required to store the maximum value for this number

### Lua

These functions wrap PICO-8's `peek` and `poke` functions to read and write data in the GPIO slots.

#### `function write_gpio(num, pin_index, bits)`

#### `function write_gpio_unsigned(num, pin_index, bits)`

#### `function read_gpio(pin_index, bits)`

#### `function read_gpio_unsigned(pin_index,bits)`

### JavaScript

All of these functions assume `gpio` is a 128-length array filled with numbers that are either 0 or 255. Although these are intended for handling PICO-8 data, they can be used anywhere it could be useful to encode numbers in a binary array.

*Note*: The write functions mutate the `gpio` argument - clone first with `var gpioClone = gpio.slice()` if you don't want that.

#### `function writeToGpio(gpio, num, pinIndex, bits)`

#### `function writeToGpioUnsigned(gpio, num, pinIndex, bits)`

#### `function readFromGpio(gpio, pinIndex, bits)`

#### `function readFromGpioUnsigned(gpio, pinIndex, bits)`

## How can I check when my GPIO pins have updated?

In PICO-8 it makes sense to just use the game update loop:

```lua
number_from_outside = 0

function _update()
 number_from_outside =
  read_gpio_unsigned(4, 3)
end
```

In JavaScript you're probably not running a game loop... so this is annoying! You might want to try [pico8-gpio-listener](https://github.com/benwiley4000/pico8-gpio-listener), which lets you listen for updates:

```javascript
var gpio = getP8Gpio();
var lastNumber = -1;
gpio.subscribe(function() {
  var num = readFromGpioUnsigned(gpio, 4, 3);
  if (num !== lastNumber) {
    console.log('Here is a new number I got from PICO-8:', num);
    lastNumber = num;
  }
});
```

## how many bits do I need?

Here's a table showing the integer ranges (signed and unsigned) you can get with different bit counts:

| Bit count | Signed range   | Unsigned range |
|-----------|----------------|----------------|
| 1         | -1 - 0         | 0 - 1          |
| 2         | -2 - 1         | 0 - 3          |
| 3         | -4 - 3         | 0 - 7          |
| 4         | -8 - 7         | 0 - 15         |
| 5         | -16 - 15       | 0 - 31         |
| 6         | -32 - 31       | 0 - 63         |
| 7         | -64 - 63       | 0 - 127        |
| 8         | -128 - 127     | 0 - 255        |
| 9         | -256 - 255     | 0 - 511        |
| 10        | -512 - 511     | 0 - 1023       |
| 11        | -1024 - 1023   | 0 - 2047       |
| 12        | -2048 - 2047   | 0 - 4095       |
| 13        | -4096 - 4095   | 0 - 8191       |
| 14        | -8192 - 8191   | 0 - 16383      |
| 15        | -16384 - 16383 | 0 - 32767      |
| 16        | -32768 - 32767 | 0 - 65535      |

## is it safe to use all of these bits?

If you use all of these bits to store a 128-bit integer, [you can safely store an unsigned integer up to 999.99999999999999999999999999999999999 Undecillion](https://en.wikipedia.org/wiki/Integer_(computer_science)#Common_integral_data_types). However PICO-8 only stores 16-bit signed integers (between -32768 and 32767), so this probably won't be very useful to you (among other reasons).

If you want it to be possible to integrate your game with GPIO pins on Pocket CHIP, the best bet is to only use pins 1-6. If you just want to target non-Pocket CHIP and Raspberry PI, you can use pins 0-7. If all you want to target is the web, you're free to use as many slots as you want, but you might not need them. For my game, we're using six pins to store two 3-bit integers, which is enough to communicate the game state relevant to vibration support.
