import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";

function ResultsTable({ results, fetching, onFetch }) {
  if (!results) return null;
  return (
    <div className="rounded-md border bg-white shadow-sm">
      <p className="px-4 py-2 font-medium border-b">
        Available References ({results.length}):
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Accession</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Length</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((item, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{item.accession}</TableCell>
              <TableCell className="text-muted-foreground">
                {item.title}
              </TableCell>
              <TableCell>
                {item.length ? `${item.length.toLocaleString()} bp` : "N/A"}
              </TableCell>
              <TableCell>
                <Button
                  size="default"
                  variant="outline"
                  disabled={fetching}
                  onClick={() => onFetch(item.accession)}
                >
                  {fetching === item.accession ? (
                    <Spinner className="animate-spin" />
                  ) : (
                    "Fetch"
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default ResultsTable;
