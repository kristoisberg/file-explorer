import React, { useState } from "react";
import { Table as ReactstrapTable } from "reactstrap";

type SortOrder = "asc" | "desc";
type Alignment = "left" | "center" | "right";
type TableData = { [key: string]: string | number };

type Column<T extends TableData> = {
  name: string;
  alignment?: Alignment;
  render: (value: T) => JSX.Element | string;
  sort: (a: T, b: T) => number;
};

export type Columns<T extends TableData> = {
  [key in keyof Partial<T>]: Column<T>;
};

type Props<T extends TableData> = {
  name: string;
  columns: Columns<T>;
  data: T[];
  keyColumn: keyof T;
  defaultSortColumn: keyof T;
  defaultSortOrder: SortOrder;
  actions?: (row: T) => JSX.Element;
};

const Table = <T extends TableData>({
  name,
  columns,
  data,
  actions,
  keyColumn,
  defaultSortColumn,
  defaultSortOrder,
}: Props<T>): JSX.Element => {
  const [sortColumn, setSortColumn] = useState<keyof T>(defaultSortColumn);
  const [sortOrder, setSortOrder] = useState<SortOrder>(defaultSortOrder);

  const sortedData = [...data].sort(
    (a, b) => columns[sortColumn].sort(a, b) * (sortOrder === "asc" ? 1 : -1)
  );

  const onClickColumn = (column: keyof T): void => {
    if (sortColumn === column) {
      setSortOrder((order) => (order === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
    }
  };

  return (
    <>
      <h5 className="display-5">{name}</h5>
      <ReactstrapTable bordered striped>
        <thead className="thead">
          <tr>
            {Object.entries(columns).map(
              ([property, { name: columnName, alignment }]) => (
                <th
                  scope="col"
                  key={columnName}
                  onClick={(): void => onClickColumn(property)}
                  className={`text-${alignment || "left"}`}
                >
                  {columnName}
                </th>
              )
            )}
            {actions && (
              <th scope="col" className="text-center">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row) => (
            <tr key={row[keyColumn]}>
              {Object.entries(columns).map(
                ([, { name: columnName, render, alignment }]) => (
                  <td
                    key={columnName}
                    className={`text-${alignment || "left"}`}
                  >
                    {render(row)}
                  </td>
                )
              )}
              {actions && <td className="text-center">{actions(row)}</td>}
            </tr>
          ))}
        </tbody>
      </ReactstrapTable>
    </>
  );
};

export default Table;
