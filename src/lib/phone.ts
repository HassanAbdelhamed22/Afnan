const EGYPTIAN_MOBILE_REGEX = /^01[0125]\d{8}$/;

export class InvalidEgyptianPhoneError extends Error {
  constructor() {
    super("Enter a valid Egyptian mobile number");
    this.name = "InvalidEgyptianPhoneError";
  }
}

export function normalizeEgyptianPhone(
  rawValue: string,
): string {
  const digits = rawValue.replace(/\D/g, "");

  let localNumber = digits;

  if (digits.startsWith("0020")) {
    localNumber = digits.slice(4);
  } else if (digits.startsWith("20")) {
    localNumber = digits.slice(2);
  }

  if (!localNumber.startsWith("0")) {
    localNumber = `0${localNumber}`;
  }

  if (!EGYPTIAN_MOBILE_REGEX.test(localNumber)) {
    throw new InvalidEgyptianPhoneError();
  }

  return `+20${localNumber.slice(1)}`;
}
