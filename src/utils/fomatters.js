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
