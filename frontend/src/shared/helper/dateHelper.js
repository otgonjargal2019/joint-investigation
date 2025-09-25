function toIsoString(str) {
  // Replace space with "T" so Date parses correctly
  const isoStr = str.replace(" ", "T");
  return new Date(isoStr).toISOString();
}

function fromIsoString(isoStr, useUTC = false) {
  const date = new Date(isoStr);
  const pad = (n) => String(n).padStart(2, "0");

  const year = useUTC ? date.getUTCFullYear() : date.getFullYear();
  const month = pad(useUTC ? date.getUTCMonth() + 1 : date.getMonth() + 1);
  const day = pad(useUTC ? date.getUTCDate() : date.getDate());
  const hour = pad(useUTC ? date.getUTCHours() : date.getHours());
  const minute = pad(useUTC ? date.getUTCMinutes() : date.getMinutes());
  const second = pad(useUTC ? date.getUTCSeconds() : date.getSeconds());

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}
export { toIsoString, fromIsoString };
