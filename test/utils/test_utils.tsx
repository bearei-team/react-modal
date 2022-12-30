import { queries, render, RenderOptions } from '@testing-library/react';
import type React from 'react';
import type { FC, ReactElement, ReactNode } from 'react';
import * as customQueries from './custom_queries';

const AllTheProviders: FC<{ children: ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper' | 'queries'>,
) =>
  render(ui, {
    wrapper: AllTheProviders,
    queries: { ...queries, ...customQueries },
    ...options,
  });

export * from '@testing-library/react';
export { customRender as render };
