import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import {
  getFilePathFromRequest,
  getFileFullPath,
  getFileNameFromPath,
  getFileMimeType,
} from "../../utils";

export default async (
  req: NextApiRequest,
  res: NextApiResponse<string>
): Promise<void> => {
  const filePath = getFilePathFromRequest(req);
  const fullPath = getFileFullPath(filePath);
  const fileName = getFileNameFromPath(filePath);

  res.setHeader("Content-type", getFileMimeType(filePath));
  res.setHeader("Content-disposition", `attachment; filename=${fileName}`);
  res.status(200);

  fs.createReadStream(fullPath).pipe(res);
};
