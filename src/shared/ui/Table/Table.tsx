import type { ReactNode } from "react";
import { cx } from "../cx";
import "./Table.css";

export interface Column<Row> {
  key: string;
  header: ReactNode;
  /** Cell renderer. */
  render: (row: Row) => ReactNode;
  /** Numeric column: end-aligned + tabular-nums. */
  numeric?: boolean;
  /** Monospace column (IDs). */
  mono?: boolean;
}

export interface TableProps<Row> {
  columns: Column<Row>[];
  rows: Row[];
  rowKey: (row: Row) => string;
  hover?: boolean;
  onRowClick?: (row: Row) => void;
  empty?: ReactNode;
}

export function Table<Row>({
  columns,
  rows,
  rowKey,
  hover = true,
  onRowClick,
  empty = "No data",
}: TableProps<Row>) {
  return (
    <div className="table-scroll">
      <table className={cx("table", hover && "table--hover")}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={cx(c.numeric && "num")}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ color: "var(--c-ink-soft)" }}>
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                style={onRowClick ? { cursor: "pointer" } : undefined}
              >
                {columns.map((c) => (
                  <td key={c.key} className={cx(c.numeric && "num", c.mono && "mono")}>
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
