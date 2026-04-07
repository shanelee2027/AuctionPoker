export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I/O/0/1 to avoid confusion
  let code = '';
  const array = new Uint8Array(4);
  crypto.getRandomValues(array);
  for (let i = 0; i < 4; i++) {
    code += chars[array[i] % chars.length];
  }
  return code;
}

export function randomInt(min: number, max: number): number {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return min + (array[0] % (max - min + 1));
}

export function randomPick<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}
