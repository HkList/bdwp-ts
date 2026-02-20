export type MaybePromise<T> = Promise<T> | T

export type StringKeys<T> = Extract<keyof T, string>

export type Oneof<T extends unknown[]> = T[number]
