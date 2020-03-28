import { NextApiRequest } from "next";
import { promises as fs, Stats } from "fs";
import path from "path";
import { initial, last } from "lodash";
import * as mime from "mime";
import { getRootDirectory } from "./config";

export const PATH_SEPARATOR = "/";

export const validateFilePath = (filePath: string): void => {
  if (filePath.includes("..")) {
    throw new Error("invalid path");
  }
};

export const normaliseFilePath = (originalPath: string): string =>
  originalPath.split(path.sep).join(PATH_SEPARATOR);

export const getFileNameFromPath = (filePath: string): string =>
  last(filePath.split(PATH_SEPARATOR)) || "";

export const getFilePathFromRequest = (req: NextApiRequest): string => {
  const filePath = (req.query.path || "") as string;
  validateFilePath(filePath);
  return filePath;
};

export const getFileFullPath = (filePath: string): string =>
  path.resolve(getRootDirectory(), filePath);

export const getDirectoryChildrenPaths = async (
  directoryPath: string
): Promise<string[]> => fs.readdir(directoryPath);

export const getParentDirectoryPath = (filePath: string): string =>
  initial(filePath.split(PATH_SEPARATOR)).join(PATH_SEPARATOR);

export const getFileStats = async (filePath: string): Promise<Stats> =>
  fs.stat(filePath);

export const getFileMimeType = (filePath: string): string =>
  mime.getType(filePath) || "application/octet-stream";

export const getFileNameWithoutExtension = (filePath: string): string =>
  path.parse(filePath).name;
