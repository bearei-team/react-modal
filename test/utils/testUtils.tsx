import React, {FC, ReactElement} from 'react';
import {render, RenderOptions, queries} from '@testing-library/react';
import * as customQueries from './customQueries';

const AllTheProviders: FC<{children: React.ReactNode}> = ({children}) => {
  return <>{children}</>;
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper' | 'queries'>) =>
  render(ui, {
    wrapper: AllTheProviders,
    queries: {...queries, ...customQueries},
    ...options,
  });

export * from '@testing-library/react';
export {customRender as render};
