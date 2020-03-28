import { NextApiRequest, NextApiResponse } from "next";
import { Stats } from "fs";
import path from "path";
import { partition } from "lodash";
import { formatISO } from "date-fns";
import {
  normaliseFilePath,
  getFileNameFromPath,
  getFilePathFromRequest,
  getFileFullPath,
  getDirectoryChildrenPaths,
  getParentDirectoryPath,
  getFileStats,
} from "../../utils";
import { ActiveDirectory, BaseDirectory } from "../../types/directory";

type FileNameAndStats = {
  name: string;
  stats: Stats;
};

const buildParents = async (originalPath: string): Promise<BaseDirectory[]> => {
  // only mutable/modifiable variables in the project :(
  const parents: BaseDirectory[] = [];
  let directoryPath = originalPath;

  while (directoryPath !== "") {
    const parentPath = getParentDirectoryPath(directoryPath);
    // eslint-disable-next-line no-await-in-loop
    const { ino: id } = await getFileStats(getFileFullPath(parentPath));

    parents.unshift({
      id,
      name: getFileNameFromPath(parentPath),
      path: normaliseFilePath(parentPath),
    });

    directoryPath = parentPath;
  }

  return parents;
};

const getDirectoryChildren = async (
  fullPath: string
): Promise<FileNameAndStats[]> => {
  const fileNames = await getDirectoryChildrenPaths(fullPath);

  return (
    await Promise.all(
      fileNames.map((file) => getFileStats(path.resolve(fullPath, file)))
    )
  ).map((stats, index) => ({
    name: fileNames[index],
    stats,
  }));
};

const separateDirectoriesAndFiles = (
  children: FileNameAndStats[]
): [FileNameAndStats[], FileNameAndStats[]] =>
  partition(children, (file) => file.stats.isDirectory());

export default async (
  req: NextApiRequest,
  res: NextApiResponse<ActiveDirectory>
): Promise<void> => {
  const directoryPath = getFilePathFromRequest(req);
  const fullPath = getFileFullPath(directoryPath);
  const children = await getDirectoryChildren(fullPath);
  const [directories, files] = separateDirectoriesAndFiles(children);
  const { ino: id } = await getFileStats(fullPath);

  const result: ActiveDirectory = {
    id,
    name: getFileNameFromPath(directoryPath),
    path: normaliseFilePath(directoryPath),
    parents: await buildParents(directoryPath),
    directories: directories.map(({ name, stats: { ino, ctime, mtime } }) => ({
      id: ino,
      name,
      path: normaliseFilePath(path.join(directoryPath, name)),
      createdDate: formatISO(ctime),
      modifiedDate: formatISO(mtime),
    })),
    files: files.map(({ name, stats: { ino, size, ctime, mtime } }) => ({
      id: ino,
      name,
      path: normaliseFilePath(path.join(directoryPath, name)),
      size,
      createdDate: formatISO(ctime),
      modifiedDate: formatISO(mtime),
    })),
  };

  res.status(200).json(result);
};
