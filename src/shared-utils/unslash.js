export const unslash = (value) => {
  let returnValue = value;
  while (returnValue.indexOf('/') === 0) {
    returnValue = returnValue.substring(1);
  }
  while (returnValue.lastIndexOf('/') === returnValue.length - 1) {
    returnValue = returnValue.substring(0, returnValue.length - 1);
  }
  return returnValue;
};
