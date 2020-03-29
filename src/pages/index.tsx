import React from "react";
import { NextPage, NextPageContext } from "next";
import Head from "next/head";
import fetch from "isomorphic-unfetch";
import { Container, Breadcrumb, BreadcrumbItem } from "reactstrap";
import { parseISO, format } from "date-fns";
import prettyBytes from "pretty-bytes";
import { ActiveDirectory, ChildDirectory } from "../types/directory";
import { File } from "../types/file";
import { getPageTitle } from "../config";
import Table, { Columns } from "../components/table";

type Props = {
  title: string;
  contents: ActiveDirectory;
};

const formatDate = (date: string): string =>
  format(parseISO(date), "dd.MM.yyyy HH:mm:ss");

const getDirectoryName = (name: string): string => name || "Root";

const DIRECTORY_COLUMNS: Columns<ChildDirectory> = {
  name: {
    name: "Name",
    render: ({ name, path }): JSX.Element => (
      <a href={`?path=${path}`}>{name}</a>
    ),
    sort: ({ name: a }, { name: b }): number => a.localeCompare(b),
  },
  createdDate: {
    name: "Created date",
    alignment: "center",
    render: ({ createdDate }): string => formatDate(createdDate),
    sort: ({ createdDate: a }, { createdDate: b }): number =>
      a.localeCompare(b),
  },
  modifiedDate: {
    name: "Modified date",
    alignment: "center",
    render: ({ modifiedDate }): string => formatDate(modifiedDate),
    sort: ({ modifiedDate: a }, { modifiedDate: b }): number =>
      a.localeCompare(b),
  },
};

const FILE_COLUMNS: Columns<File> = {
  name: {
    name: "Name",
    render: ({ name }): string => name,
    sort: ({ name: a }, { name: b }): number => a.localeCompare(b),
  },
  size: {
    name: "Size",
    alignment: "center",
    render: ({ size }): string => prettyBytes(size),
    sort: ({ size: a }, { size: b }): number => (a < b ? -1 : 1),
  },
  createdDate: {
    name: "Created date",
    alignment: "center",
    render: ({ createdDate }): string => formatDate(createdDate),
    sort: ({ createdDate: a }, { createdDate: b }): number =>
      a.localeCompare(b),
  },
  modifiedDate: {
    name: "Modified date",
    alignment: "center",
    render: ({ modifiedDate }): string => formatDate(modifiedDate),
    sort: ({ modifiedDate: a }, { modifiedDate: b }): number =>
      a.localeCompare(b),
  },
};

const DirectoryPage: NextPage<Props> = ({
  title,
  contents: { directories, files, parents, name },
}) => (
  <>
    <Head>
      <title>{title}</title>
    </Head>
    <Container>
      <h1 className="display-1">{title}</h1>

      <Breadcrumb>
        {parents.map(({ id, name: parentName, path }) => (
          <BreadcrumbItem key={id}>
            <a href={`?path=${path}`}>{getDirectoryName(parentName)}</a>
          </BreadcrumbItem>
        ))}

        <BreadcrumbItem active>{getDirectoryName(name)}</BreadcrumbItem>
      </Breadcrumb>

      {directories.length > 0 && (
        <Table<ChildDirectory>
          name="Subdirectories"
          columns={DIRECTORY_COLUMNS}
          data={directories}
          keyColumn="id"
          defaultSortColumn="name"
          defaultSortOrder="asc"
          actions={({ path }): JSX.Element => (
            <a
              href={`/api/archive?path=${path}`}
              download
              className="btn btn-primary"
            >
              .zip
            </a>
          )}
        />
      )}

      <Table<File>
        name="Files"
        columns={FILE_COLUMNS}
        data={files}
        keyColumn="id"
        defaultSortColumn="name"
        defaultSortOrder="asc"
        actions={({ path }): JSX.Element => (
          <>
            <a
              href={`/api/download?path=${path}`}
              download
              className="btn btn-primary"
            >
              Download
            </a>
            <a
              href={`/api/archive?path=${path}`}
              download
              className="btn btn-primary"
            >
              .zip
            </a>
          </>
        )}
      />
    </Container>
  </>
);

DirectoryPage.getInitialProps = async ({
  query,
}: NextPageContext): Promise<Props> => {
  const directoryPath = (query.path || "") as string;

  return {
    title: getPageTitle(),
    contents: (await (
      await fetch(`http://localhost:3000/api/directory?path=${directoryPath}`)
    ).json()) as ActiveDirectory,
  };
};

export default DirectoryPage;
