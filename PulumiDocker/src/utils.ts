export function generateRandomString(length : number) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
  
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }
  
    return result;
}

export const convertToAlphaNum = (inputString : string) => {
  
  if (/^[a-zA-Z0-9]+$/.test(inputString)) {
    return inputString;
  }

  const alphanumericString = inputString.replace(/[^a-zA-Z0-9]/g, '');

  return alphanumericString;
}

export const createKey = (index: number, pathArray: string[]): string => {
  let key: string = '';
  for (let i: number = 0; i <= index; i++) {
    key = `${key}${pathArray[i]}`;
  }
  return key;
}