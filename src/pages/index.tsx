import React from "react";
import { NextPage, NextPageContext } from "next";
import fetch from "isomorphic-unfetch";
import { Container, Table, Breadcrumb, BreadcrumbItem } from "reactstrap";
import { parseISO, format } from "date-fns";
import prettyBytes from "pretty-bytes";
import PropTypes from "prop-types";
import { ActiveDirectory } from "../types/directory";
import { getPageTitle } from "../config";

export type Props = {
  title: string;
  contents: ActiveDirectory;
};

const getDirectoryName = (name: string): string => name || "Root";

const formatDate = (date: string): string =>
  format(parseISO(date), "dd.MM.yyyy HH:mm:ss");

const DirectoryPage: NextPage<Props> = ({
  title,
  contents: { directories, files, parents, name },
}) => (
  <Container>
    <style jsx>
      {`
        h5 {
          margin-top: 50px;
        }

        h1 {
          margin-bottom: 50px;
        }

        a.btn:not(:first-of-type) {
          margin-left: 2px;
        }
      `}
    </style>
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
      <>
        <h5 className="display-5">Subdirectories</h5>
        <Table bordered striped>
          <thead className="thead">
            <th scope="col">Name</th>
            <th scope="col">Created date</th>
            <th scope="col">Modified date</th>
            <th scope="col">Actions</th>
          </thead>
          <tbody>
            {directories.map(
              ({
                id,
                name: directoryName,
                path,
                createdDate,
                modifiedDate,
              }) => (
                <tr key={id}>
                  <td>
                    <a href={`?path=${path}`}>{directoryName}</a>
                  </td>
                  <td>{formatDate(createdDate)}</td>
                  <td>{formatDate(modifiedDate)}</td>
                  <td>
                    <a
                      href={`/api/archive?path=${path}`}
                      download
                      className="btn btn-primary"
                    >
                      .zip
                    </a>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </Table>
      </>
    )}

    <h5 className="display-5">Files</h5>
    <Table bordered striped>
      <thead className="thead">
        <th scope="col">Name</th>
        <th scope="col">Size</th>
        <th scope="col">Created date</th>
        <th scope="col">Modified date</th>
        <th scope="col">Actions</th>
      </thead>
      <tbody>
        {files.map(
          ({ id, name: fileName, size, path, createdDate, modifiedDate }) => (
            <tr key={id}>
              <td>{fileName}</td>
              <td>{prettyBytes(size)}</td>
              <td>{formatDate(createdDate)}</td>
              <td>{formatDate(modifiedDate)}</td>
              <td>
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
              </td>
            </tr>
          )
        )}
      </tbody>
    </Table>
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
