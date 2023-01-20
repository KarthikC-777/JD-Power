export const validateVin = (vin: string) => {
  if (undefined !== vin && vin.length === 17) return true;
  else return false;
};
