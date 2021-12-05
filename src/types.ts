export interface Result {
  parent: any;
  value: any;
  layer: number;
}

export interface Options {
  ignoreCase?: boolean;
  ignoreType?: boolean;
  ignoreKeys?: boolean;
  matchExact?: boolean;
}

export enum Type {
  String = "string",
  Number = "number",
  Boolean = "boolean",
  Undefined = "undefined",
  Object = "object",
}
