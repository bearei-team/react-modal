import {pickHTMLAttributes} from '@bearei/react-util';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import React from 'react';
import Modal from '../../src/components/Modal';
import {render} from '../utils/testUtils';

describe('test/components/Modal.test.ts', () => {
  test('It should be a render modal', async () => {
    const {getByDataCy} = render(
      <Modal
        renderHeader={({}) => <div data-cy="header">"header"</div>}
        renderFooter={({}) => <div data-cy="footer">"footer"</div>}
        renderMain={({header, footer, ...props}) => (
          <div {...pickHTMLAttributes(props)} data-cy="modal">
            {header}
            "modal"
            {footer}
          </div>
        )}
        renderContainer={({id, children}) => (
          <div data-cy="container" data-id={id} tabIndex={1}>
            {children}
          </div>
        )}
      />,
    );

    expect(getByDataCy('container')).toHaveAttribute('tabIndex');
    expect(getByDataCy('modal')).toHaveTextContent('modal');
    expect(getByDataCy('header')).toHaveTextContent('header');
    expect(getByDataCy('footer')).toHaveTextContent('footer');
  });

  test('It should be a modal click', async () => {
    const user = userEvent.setup();
    let result!: boolean | undefined;

    const {getByDataCy} = render(
      <Modal
        onVisible={({visible}) => (result = visible)}
        onClick={() => {}}
        defaultVisible={true}
        renderMain={({onClick, ...props}) => (
          <div {...pickHTMLAttributes(props)} data-cy="modal" onClick={onClick}>
            "modal"
          </div>
        )}
        renderContainer={({...props}) => (
          <div {...pickHTMLAttributes(props)} data-cy="modal">
            "modal"
          </div>
        )}
      />,
    );

    await user.click(getByDataCy('modal'));
    expect(typeof result).toEqual('boolean');
  });

  test('It should be a disabled modal', async () => {
    const user = userEvent.setup();
    let result!: boolean | undefined;

    const {getByDataCy} = render(
      <Modal
        onVisible={({visible}) => (result = visible)}
        onClick={() => {}}
        disabledModalClose
        renderMain={({onClick, ...props}) => (
          <div {...pickHTMLAttributes(props)} data-cy="modal" onClick={onClick}>
            "modal"
          </div>
        )}
        renderContainer={({...props}) => (
          <div {...pickHTMLAttributes(props)} data-cy="modal">
            "modal"
          </div>
        )}
      />,
    );

    await user.click(getByDataCy('modal'));
    expect(result).toEqual(undefined);
  });

  test('It should be the modal loading', async () => {
    const user = userEvent.setup();
    let result!: boolean | undefined;

    const {getByDataCy} = render(
      <Modal
        onVisible={({visible}) => (result = visible)}
        onClick={() => {}}
        loading
        renderMain={({onClick, ...props}) => (
          <div {...pickHTMLAttributes(props)} data-cy="modal" onClick={onClick}>
            "modal"
          </div>
        )}
        renderContainer={({id, children}) => (
          <div data-cy="container" data-id={id} tabIndex={1}>
            {children}
          </div>
        )}
      />,
    );

    await user.click(getByDataCy('modal'));
    expect(result).toEqual(undefined);
  });
});
