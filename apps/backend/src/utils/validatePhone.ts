export const phoneReg = /^1[3-9]\d{9}$/

export function validatePhone(phone: string): boolean {
  return phoneReg.test(phone)
}
