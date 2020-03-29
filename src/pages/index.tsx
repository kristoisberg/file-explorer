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
import Table, { Column } from "../components/table";

type Props = {
  title: string;
  contents: ActiveDirectory;
};

const formatDate = (date: string): string =>
  format(parseISO(date), "dd.MM.yyyy HH:mm:ss");

const getDirectoryName = (name: string): string => name || "Root";

const DIRECTORY_COLUMNS: Column<ChildDirectory>[] = [
  { name: "Name", property: "name", render: (value): string => String(value) },
  {
    name: "Created date",
    property: "createdDate",
    render: (value): string => formatDate(String(value)),
  },
  {
    name: "Modified date",
    property: "modifiedDate",
    render: (value): string => formatDate(String(value)),
  },
];

const FILE_COLUMNS: Column<File>[] = [
  { name: "Name", property: "name", render: (value): string => String(value) },
  {
    name: "Size",
    property: "size",
    render: (value): string => prettyBytes(Number(value)),
  },
  {
    name: "Created date",
    property: "createdDate",
    render: (value): string => formatDate(String(value)),
  },
  {
    name: "Modified date",
    property: "modifiedDate",
    render: (value): string => formatDate(String(value)),
  },
];

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
