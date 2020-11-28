export const REGEX_PHONE = /^\([\d]{2}\) ((\d \d{4})|(\d{4}))(-\d{4})$/;

export function validatePhone(value = '') {
  return REGEX_PHONE.test(value);
}

export default {};
