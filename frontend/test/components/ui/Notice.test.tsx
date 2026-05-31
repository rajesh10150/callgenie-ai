import { render, screen } from '@testing-library/react';
import Notice from '@/components/ui/Notice';

describe('ui/Notice', () => {
  it('renders nothing when notice is null', () => {
    const { container } = render(<Notice notice={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders a success notice', () => {
    render(<Notice notice={{ type: 'success', text: 'Saved!' }} />);
    expect(screen.getByText('Saved!')).toBeInTheDocument();
  });

  it('renders an error notice', () => {
    render(<Notice notice={{ type: 'error', text: 'Failed!' }} />);
    expect(screen.getByText('Failed!')).toBeInTheDocument();
  });
});
