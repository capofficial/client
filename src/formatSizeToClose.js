function formatSizeToClose(size) {
  if (typeof size !== 'number') {
    throw new Error('Size must be a number');
  }
  const units = ['B', 'KB', 'MB', 'GB'];
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

// Example usage:
console.log(formatSizeToClose(500)); // '0.49 KB'
console.log(formatSizeToClose(1500)); // '1.46 KB'
console.log(formatSizeToClose(2000000)); // '1.91 MB'