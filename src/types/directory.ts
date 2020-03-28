import { File } from "./file";

export type BaseDirectory = {
  id: number;
  name: string;
  path: string;
};

export type ChildDirectory = BaseDirectory & {
  createdDate: string;
  modifiedDate: string;
};

export type ActiveDirectory = BaseDirectory & {
  parents: BaseDirectory[];
  directories: ChildDirectory[];
  files: File[];
};
