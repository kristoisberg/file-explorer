import React from "react";
import { NextPage, NextPageContext } from "next";
import fetch from "isomorphic-unfetch";
import { Container, Breadcrumb, BreadcrumbItem } from "reactstrap";
import { parseISO, format } from "date-fns";
import prettyBytes from "pretty-bytes";
import PropTypes from "prop-types";
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
    render: (value): string => String(value),
    sort: (a, b): number => String(a).localeCompare(String(b)),
  },
  createdDate: {
    name: "Created date",
    render: (value): string => formatDate(String(value)),
    sort: (a, b): number => String(a).localeCompare(String(b)),
  },
  modifiedDate: {
    name: "Modified date",
    render: (value): string => formatDate(String(value)),
    sort: (a, b): number => String(a).localeCompare(String(b)),
  },
};

const FILE_COLUMNS: Columns<File> = {
  name: {
    name: "Name",
    render: (value): string => String(value),
    sort: (a, b): number => String(a).localeCompare(String(b)),
  },
  size: {
    name: "Size",
    render: (value): string => prettyBytes(Number(value)),
    sort: (a, b): number => (Number(a) < Number(b) ? 1 : -1),
  },
  createdDate: {
    name: "Created date",
    render: (value): string => formatDate(String(value)),
    sort: (a, b): number => String(a).localeCompare(String(b)),
  },
  modifiedDate: {
    name: "Modified date",
    render: (value): string => formatDate(String(value)),
    sort: (a, b): number => String(a).localeCompare(String(b)),
  },
};

const DirectoryPage: NextPage<Props> = ({
  title,
  contents: { directories, files, parents, name },
}) => (
  <Container>
    <h1 className="display-1" style={{ marginBottom: 50 }}>
      {title}
    </h1>

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
            style={{ marginRight: 2 }}
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
);

// oh god why do i do this to myself
DirectoryPage.propTypes = {
  title: PropTypes.string.isRequired,
  contents: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    parents: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        path: PropTypes.string.isRequired,
      }).isRequired
    ).isRequired,
    directories: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        path: PropTypes.string.isRequired,
        createdDate: PropTypes.string.isRequired,
        modifiedDate: PropTypes.string.isRequired,
      }).isRequired
    ).isRequired,
    files: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        path: PropTypes.string.isRequired,
        size: PropTypes.number.isRequired,
        createdDate: PropTypes.string.isRequired,
        modifiedDate: PropTypes.string.isRequired,
      }).isRequired
    ).isRequired,
  }).isRequired,
};

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
