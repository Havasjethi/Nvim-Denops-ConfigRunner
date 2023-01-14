declare global {
  export interface String {
    resolve(other?: string): string;
  }
}

String.prototype.resolve = function (this: string, other?: string) {
  return !other ? this : this.concat('/', other);
};
