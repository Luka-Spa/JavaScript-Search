import { Options, Result, Type } from "./types";

export default async function find(value: any, data: any, options: Options = defaultOptions): Promise<Result[]> {
  const searchResult: Result[] = [];
  await findIn(value, data, searchResult, options || defaultOptions);
  return searchResult;
}

const defaultOptions: Options = { ignoreCase: false, ignoreKeys: false, ignoreType: false, matchExact: false };

async function findIn(_value: any, _data: any, searchResult: Result[], options: Options, parent = _data, layer = 0) {
  switch (typeof _data) {
    case Type.Boolean:
      await findInBoolean(_value, _data, searchResult, parent, layer, options);
      break;
    case Type.Number:
      await findInNumber(_value, _data, searchResult, parent, layer, options);
      break;
    case Type.String:
      await findInString(_value, _data, searchResult, parent, layer, options);
      break;
    case Type.Object:
      if (Array.isArray(_data)) await findInArray(_value, _data, searchResult, parent, layer, options);
      else await findInObject(_value, _data, searchResult, parent, layer, options);
      break;
  }
}

async function findInBoolean(value: any, data: Boolean, searchResult: Result[], parent: Object, layer: number, options: Options) {
  if (options.ignoreType) {
    if (value === String(data)) searchResult.push({ value: data, parent: parent, layer: layer });
  } else if (value === data) searchResult.push({ value: data, parent: parent, layer: layer });
}
async function findInNumber(value: any, data: Number, searchResult: Result[], parent: Object, layer: number, options: Options) {
  if (options.matchExact) {
    if (data === value) searchResult.push({ value: data, parent: parent, layer: layer });
  }
  if (options.ignoreType) {
    if (String(data).includes(String(value))) searchResult.push({ value: data, parent: parent, layer: layer });
  } else if (typeof value === "number" && String(data).includes(String(value)))
    searchResult.push({ value: data, parent: parent, layer: layer });
}
async function findInString(value: any, data: String, searchResult: Result[], parent: Object, layer: number, options: Options) {
  const _value = options.ignoreCase && typeof value === Type.String ? value.toLowerCase() : value;
  const _data = options.ignoreCase ? data.toLowerCase() : data;
  if (options.matchExact) {
    if (value === data) searchResult.push({ value: data, parent: parent, layer: layer });
  } else if (options.ignoreType) {
    if (_data.includes(_value)) {
      searchResult.push({ value: data, parent: parent, layer: layer });
    }
  } else {
    if (typeof _value === "string" && _data.includes(_value)) {
      searchResult.push({ value: data, parent: parent, layer: layer });
    }
  }
}
async function findInObject(value: any, data: any, searchResult: Result[], parent: Object, layer: number, options: Options) {
  for (const key of Object.keys(data)) {
    if (!options.ignoreKeys) await findInString(value, key, searchResult, data, layer + 1, options);
    await findIn(value, data[key], searchResult, options, data, layer + 1);
  }
}
async function findInArray(value: any, data: any[], searchResult: Result[], parent: Object, layer: number, options: Options) {
  for (const el of data) {
    await findIn(value, el, searchResult, options, data, layer);
  }
}

export async function filterMap(value: any, data: any, callback: Function, options: Options = defaultOptions, whitelist?: Map<any, any>) {
  await isIn(value, data, callback, options, whitelist);
}

async function isIn(_value: any, _data: any, callback: Function, options: Options, whitelist?: Map<any, any>) {
  let isIn = false;
  switch (typeof _data) {
    case Type.Boolean:
      isIn = await isInBoolean(_value, _data, options, whitelist);
      break;
    case Type.Number:
      isIn = await isInNumber(_value, _data, options, whitelist);
      break;
    case Type.String:
      isIn = await isInString(_value, _data, options, whitelist);
      break;
    case Type.Object:
      if (Array.isArray(_data)) isIn = await isInArray(_value, _data, callback, options, whitelist);
      else {
        isIn = await isInObject(_value, _data, callback, options, whitelist);
      }
      break;
  }
  if (isIn) callback(_value);
  return isIn;
}

async function isInBoolean(value: any, data: Boolean, options: Options, whitelist?: Map<any, any>): Promise<boolean> {
  if (options.ignoreType) {
    if (value === String(data)) return true;
  } else if (value === data) return true;
  return false;
}
async function isInNumber(value: any, data: Number, options: Options, whitelist?: Map<any, any>): Promise<boolean> {
  if (options.matchExact) {
    if (data === value) return true;
  }
  if (options.ignoreType) {
    if (String(data).includes(String(value))) return true;
  } else if (typeof value === "number" && String(data).includes(String(value))) return true;
  return false;
}
async function isInString(value: any, data: String, options: Options, whitelist?: Map<any, any>): Promise<boolean> {
  const _value = options.ignoreCase && typeof value === Type.String ? value.toLowerCase() : value;
  const _data = options.ignoreCase ? data.toLowerCase() : data;
  if (options.matchExact) {
    if (value === data) return true;
  } else if (options.ignoreType) {
    if (_data.includes(_value)) {
      return true;
    }
  } else {
    if (typeof _value === "string" && _data.includes(_value)) return true;
  }
  return false;
}
async function isInObject(value: any, data: Object, callback: Function, options: Options, whitelist?: Map<any, any>): Promise<boolean> {
  for (const key of Object.keys(data)) {
    if (!options.ignoreKeys) return await isInString(value, key, options, whitelist);
    return await isIn(value, key, callback, options, whitelist);
  }
  return false;
}
async function isInArray(value: any, data: any[], callback: Function, options: Options, whitelist?: Map<any, any>): Promise<boolean> {
  for (const el of data) {
    return await isIn(value, el, callback, options, whitelist);
  }
  return false;
}
