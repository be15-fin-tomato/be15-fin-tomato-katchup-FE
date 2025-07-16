export const formatNumber = (num) => {
  const parsedNum = parseFloat(num);
  if (isNaN(parsedNum)) return '0';

  if (parsedNum < 10000) {
    const fixedNum = parsedNum.toFixed(1);
    if (fixedNum.endsWith('.0')) {
      return Math.floor(parsedNum).toLocaleString();
    } else {
      return fixedNum.toLocaleString();
    }
  } else {
    const inTenThousands = parsedNum / 10000;
    const fixedNum = inTenThousands.toFixed(1);

    if (fixedNum.endsWith('.0')) {
      return `${Math.floor(inTenThousands)}만`;
    } else {
      return `${fixedNum}만`;
    }
  }
};

export const getDisplayedRealName = (realNameString) => {
  if (!realNameString) {
    return null;
  }
  const names = realNameString.split(',').map(name => name.trim()).filter(name => name.length > 0);

  if (names.length === 0) {
    return null;
  }
  if (names.length === 1) {
    return names[0];
  }
  return `${names[0]} 외 ${names.length - 1}명`;
};
