import { toPattern } from 'vanilla-masker';

export function formatPhoneNumber(value) {
  return value.replace(/[^\d]/g, '').length > 10
    ? toPattern(value, '(99) 9 9999-9999')
    : toPattern(value, '(99) 9999-9999');
}

export default {};
