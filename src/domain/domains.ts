const LABEL = /^(?!-)[a-z0-9-]{1,63}(?<!-)$/;
const TLD = /^[a-z]{2,63}$/;

/**
 * A bare hostname such as "tienda.com.ar": no scheme, path or port,
 * at least two labels and an alphabetic top-level domain.
 */
export const isValidDomain = (value: string): boolean => {
  const domain = value.toLowerCase();
  if (domain.length === 0 || domain.length > 253) return false;
  const labels = domain.split(".");
  if (labels.length < 2) return false;
  const tld = labels[labels.length - 1];
  return TLD.test(tld) && labels.every((label) => LABEL.test(label));
};
