import { render, screen } from '@testing-library/react';
import Badge from '@/components/ui/Badge';

describe('ui/Badge', () => {
  it('renders the humanized status when no label is given', () => {
    render(<Badge status="in_progress" />);
    expect(screen.getByText('in progress')).toBeInTheDocument();
  });

  it('renders an explicit label and applies the status color class', () => {
    render(<Badge status="active" label="Live" className="extra" />);
    const el = screen.getByText('Live');
    expect(el).toHaveClass('badge-success');
    expect(el).toHaveClass('extra');
  });
});
