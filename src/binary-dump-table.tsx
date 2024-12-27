import { JSX } from "npm:preact@10.25.3";
import { useState } from "npm:preact@10.25.3/hooks";

export interface BinaryDumpTableProps {
  buffer: ArrayBuffer;
  defaultBytesPerRow?: number;
}

export const BinaryDumpTable = (
  { buffer, defaultBytesPerRow = 16 }: BinaryDumpTableProps,
) => {
  const [bytesPerRow, setBytesPerRow] = useState(defaultBytesPerRow);

  const view = new Uint8Array(buffer);

  const rowOffsets = formatHexView(range(0, bytesPerRow), " ");

  const rows = buildArray(Math.ceil(view.length / bytesPerRow), (row) => {
    return formatRow(
      view.slice(row * bytesPerRow, (row + 1) * bytesPerRow),
      bytesPerRow,
      row,
    );
  });

  return (
    <table class="binary-dump-table">
      <thead>
        <tr>
          <th class="column-offset">Offset</th>
          <th>Hex</th>
          <th>ASCII</th>
        </tr>
        <tr class="row-offset">
          <th>
            <input
              type="number"
              min={4}
              max={32}
              step={4}
              required={true}
              defaultValue={bytesPerRow}
              onInput={(e) =>
                e.currentTarget.checkValidity() &&
                setBytesPerRow(parseInt(e.currentTarget.value))}
            />
          </th>
          <th class="column-hex">
            <pre>{rowOffsets}</pre>
          </th>
          <th class="column-ascii"></th>
        </tr>
      </thead>
      <tbody>
        {rows.map(({ offset, hex, ascii }) => (
          <tr>
            <td class="column-offset">
              <pre>{offset}</pre>
            </td>
            <td class="column-hex">
              <pre>{hex}</pre>
            </td>
            <td class="column-ascii">
              <pre>{ascii}</pre>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

function formatRow(view: Uint8Array, bytesPerRow: number, row: number) {
  const bytes = Array.from(view);

  const offset = formatOffset(bytesPerRow * row);
  const hex = formatHexView(bytes, "0");
  const ascii = formatAsciiView(bytes);

  return {
    offset,
    hex,
    ascii,
  };
}

function formatOffset(offset: number): string {
  return offset.toString(16).padStart(8, "0");
}

function formatHexView(bytes: number[], padding: string): JSX.Element[] {
  return bytes.flatMap((byte, i) => [
    i === 0 ? <></> : <span class="space">{" "}</span>,
    <code class="byte">
      {byte.toString(16).toUpperCase().padStart(2, padding)}
    </code>,
  ]);
}

const CHAR_MIDDLE_DOT = "\u00B7";

function formatAsciiView(bytes: number[]): JSX.Element[] {
  return bytes.map((byte) => {
    if (byte >= 32 && byte <= 126) {
      return <code>{String.fromCharCode(byte)}</code>;
    } else {
      return <span class="non-printable">{CHAR_MIDDLE_DOT}</span>;
    }
  });
}

function range(start: number, end: number): number[] {
  return buildArray(end - start, (i) => i + start);
}

function buildArray<T>(length: number, f: (i: number) => T): T[] {
  return Array.from({ length }, (_, i) => f(i));
}
