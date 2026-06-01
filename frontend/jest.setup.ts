import '@testing-library/jest-dom';

// @vercel/analytics injects a browser script that is irrelevant to tests; stub
// it so layout renders deterministically without touching the network.
jest.mock('@vercel/analytics/react', () => ({
  __esModule: true,
  Analytics: () => null,
}));

// framer-motion renders DOM nodes with animation-only props that React warns
// about in jsdom. Mock it to plain elements (stripping motion-only props) so
// component markup still renders for assertions and coverage.
jest.mock('framer-motion', () => {
  const React = require('react');
  const MOTION_PROPS = new Set([
    'initial', 'animate', 'exit', 'transition', 'variants',
    'whileHover', 'whileTap', 'whileInView', 'whileFocus', 'whileDrag',
    'viewport', 'layout', 'layoutId', 'drag', 'dragConstraints',
  ]);
  const clean = (props: Record<string, unknown>) => {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(props)) {
      if (!MOTION_PROPS.has(k)) out[k] = props[k];
    }
    return out;
  };
  const cache: Record<string, unknown> = {};
  const motion = new Proxy(
    {},
    {
      get: (_target, tag: string) => {
        if (!cache[tag]) {
          const Comp = React.forwardRef(({ children, ...props }: any, ref: any) =>
            React.createElement(tag, { ...clean(props), ref }, children)
          );
          Comp.displayName = `motion.${tag}`;
          cache[tag] = Comp;
        }
        return cache[tag];
      },
    }
  );
  return {
    __esModule: true,
    motion,
    AnimatePresence: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
  };
});

// recharts relies on layout measurements that jsdom does not provide. Mock the
// pieces used across the app to simple passthrough elements so the surrounding
// page/component JSX still executes.
jest.mock('recharts', () => {
  const React = require('react');
  const make = (name: string) =>
    ({ children }: { children?: React.ReactNode }) =>
      React.createElement('div', { 'data-recharts': name }, children);
  return {
    __esModule: true,
    ResponsiveContainer: make('ResponsiveContainer'),
    AreaChart: make('AreaChart'),
    Area: make('Area'),
    BarChart: make('BarChart'),
    Bar: make('Bar'),
    LineChart: make('LineChart'),
    Line: make('Line'),
    PieChart: make('PieChart'),
    Pie: make('Pie'),
    Cell: make('Cell'),
    XAxis: make('XAxis'),
    YAxis: make('YAxis'),
    CartesianGrid: make('CartesianGrid'),
    Tooltip: make('Tooltip'),
  };
});
