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
        renderMain={({...props}) => (
          <div {...pickHTMLAttributes(props)} data-cy="modal">
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

    expect(getByDataCy('container')).toHaveAttribute('tabIndex');
    expect(getByDataCy('modal')).toHaveTextContent('modal');
  });

  test('It should be a modal click', async () => {
    const user = userEvent.setup();
    let result!: boolean | undefined;

    const {getByDataCy} = render(
      <Modal
        onVisible={({visible}) => (result = visible)}
        onClick={() => {}}
        defaultVisible={true}
        renderContainer={({onClick, ...props}) => (
          <div {...pickHTMLAttributes(props)} data-cy="modal" onClick={onClick}>
            "modal"
          </div>
        )}
      />,
    );

    await user.click(getByDataCy('modal'));
    expect(typeof result).toEqual('boolean');
  });

  test('It should be a disabled modal', async () => {
    let result!: boolean | undefined;

    const {getByDataCy} = render(
      <Modal
        onVisible={({visible}) => (result = visible)}
        disabledModalClose
        renderContainer={({...props}) => (
          <div {...pickHTMLAttributes(props)} data-cy="modal">
            "modal"
          </div>
        )}
      />,
    );

    getByDataCy('modal');
    expect(result).toEqual(undefined);
  });

  test('It should be the modal loading', async () => {
    let result!: boolean | undefined;

    const {getByDataCy} = render(
      <Modal<HTMLButtonElement>
        onVisible={({visible}) => (result = visible)}
        loading
        renderMain={({...props}) => (
          <div {...pickHTMLAttributes(props)} data-cy="modal">
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

    getByDataCy('modal');
    expect(result).toEqual(undefined);
  });
});
