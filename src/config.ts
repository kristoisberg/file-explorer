export const getRootDirectory = (): string => {
  if (!process.env.ROOT_DIRECTORY) {
    throw new Error("root directory not set");
  }

  return process.env.ROOT_DIRECTORY;
};

export const getPageTitle = (): string => {
  if (!process.env.PAGE_TITLE) {
    throw new Error("page title not set");
  }

  return process.env.PAGE_TITLE;
};
