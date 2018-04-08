function write_gpio(num,pin_index,bits)
 write_gpio_unsigned(
  num + shl(1, bits-1),
  pin_index,
  bits
 )
end

function write_gpio_unsigned(num,pin_index,bits)
 local lastbit_i =
  0x5f80+pin_index+bits-1
 local mask = 1
 for j=0,bits-1 do
  local bit = shr(band(num, mask), j)
  poke(lastbit_i-j, bit*255)
  mask = shl(mask, 1)
 end
end

function read_gpio(pin_index,bits)
 return read_gpio_unsigned(
  pin_index,
  bits
 ) - shl(1, bits-1)
end

function read_gpio_unsigned(pin_index,bits)
 local firstbit_i =
  0x5f80+pin_index
 local num = 0
 for j=0,bits-1 do
  local val = peek(firstbit_i+j)
  if val > 0 then
   num = num + shl(1, bits-1-j)
  end
 end
 return num
end
