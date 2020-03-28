import { NextApiRequest, NextApiResponse } from "next";
import AdmZip from "adm-zip";
import {
  getFilePathFromRequest,
  getFileFullPath,
  getFileNameWithoutExtension,
  getFileStats,
  getFileMimeType,
} from "../../utils";

export default async (
  req: NextApiRequest,
  res: NextApiResponse<string>
): Promise<void> => {
  const zip = new AdmZip();
  const filePath = getFilePathFromRequest(req);
  const fullPath = getFileFullPath(filePath);
  const fileStats = await getFileStats(fullPath);
  const fileName = getFileNameWithoutExtension(filePath);
  const zipName = `${fileName}.zip`;

  if (fileStats.isDirectory()) {
    zip.addLocalFolder(fullPath);
  } else {
    zip.addLocalFile(fullPath);
  }

  res.setHeader("Content-type", getFileMimeType(zipName));
  res.setHeader("Content-disposition", `attachment; filename=${zipName}`);

  res.status(200);
  res.write(zip.toBuffer());
  res.end();
};
