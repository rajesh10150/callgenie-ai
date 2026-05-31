import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Inbox } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';

describe('ui/EmptyState', () => {
  it('renders the title and description', () => {
    render(<EmptyState icon={Inbox} title="No leads" description="Add one to start" />);
    expect(screen.getByText('No leads')).toBeInTheDocument();
    expect(screen.getByText('Add one to start')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders an action button that fires onClick', async () => {
    const onClick = jest.fn();
    render(<EmptyState icon={Inbox} title="t" description="d" action={{ label: 'Add', onClick }} />);
    await userEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
