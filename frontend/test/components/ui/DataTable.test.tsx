import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DataTable from '@/components/ui/DataTable';

interface Row extends Record<string, unknown> { id: string; name: string; }

const columns = [
  { key: 'name', header: 'Name' },
  { key: 'id', header: 'ID', render: (r: Row) => <span>#{r.id}</span>, className: 'w-10' },
];

describe('ui/DataTable', () => {
  it('renders headers and the empty message when there is no data', () => {
    render(<DataTable<Row> columns={columns} data={[]} emptyMessage="Nothing here" />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('uses the default empty message', () => {
    render(<DataTable<Row> columns={columns} data={[]} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('renders rows using plain values and custom renderers', () => {
    render(<DataTable<Row> columns={columns} data={[{ id: '1', name: 'Alice' }]} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('#1')).toBeInTheDocument();
  });

  it('fires onRowClick when a row is clicked', async () => {
    const onRowClick = jest.fn();
    render(<DataTable<Row> columns={columns} data={[{ id: '1', name: 'Alice' }]} onRowClick={onRowClick} />);
    await userEvent.click(screen.getByText('Alice'));
    expect(onRowClick).toHaveBeenCalledWith({ id: '1', name: 'Alice' });
  });

  it('renders an empty string for nullish cell values', () => {
    const cols = [{ key: 'missing', header: 'Missing' }];
    render(<DataTable<Row> columns={cols} data={[{ id: '1', name: 'Alice' }]} />);
    expect(screen.getByText('Missing')).toBeInTheDocument();
  });
});
