import React from "react";
import { Table as ReactstrapTable } from "reactstrap";

export type Column<T extends { [key: string]: React.Key | undefined }> = {
  name: string;
  property: keyof T;
  render: (value: T[keyof T]) => string;
};

type Props<T extends { [key: string]: React.Key | undefined }> = {
  name: string;
  columns: Column<T>[];
  data: T[];
  keyColumn: keyof T;
  actions?: (row: T) => JSX.Element;
};

// this is such a mess it even broke proptypes
function Table<T extends { [key: string]: React.Key | undefined }>({
  name,
  columns,
  data,
  actions,
  keyColumn,
}: Props<T>): JSX.Element {
  return (
    <>
      <h5 className="display-5" style={{ marginTop: 50 }}>
        {name}
      </h5>
      <ReactstrapTable bordered striped>
        <thead className="thead">
          {columns.map(({ name: columnName }) => (
            <th scope="col" key={columnName}>
              {columnName}
            </th>
          ))}
          {actions && <th scope="col">Actions</th>}
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row[keyColumn]}>
              {columns.map(({ name: columnName, property, render }) => (
                <td key={columnName}>{render(row[property])}</td>
              ))}
              {actions && <td>{actions(row)}</td>}
            </tr>
          ))}
        </tbody>
      </ReactstrapTable>
    </>
  );
}

export default Table;
