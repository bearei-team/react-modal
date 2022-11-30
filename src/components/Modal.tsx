import type {HandleEvent} from '@bearei/react-util/lib/event';
import handleEvent from '@bearei/react-util/lib/event';
import type {DetailedHTMLProps, HTMLAttributes, ReactNode, Ref, TouchEvent} from 'react';
import {useId, useCallback, useEffect, useState} from 'react';
import type {GestureResponderEvent, ViewProps} from 'react-native';

/**
 * Modal options
 */
export interface ModalOptions<E> {
  /**
   * Modal the visible status
   */
  visible?: boolean;

  /**
   * Event that triggers a modal visible state change
   */
  event?: E;
}

/**
 * Base modal props
 */
export interface BaseModalProps<T, E>
  extends Omit<
    DetailedHTMLProps<HTMLAttributes<T>, T> & ViewProps & Pick<ModalOptions<E>, 'visible'>,
    'title' | 'onClick' | 'onTouchEnd' | 'onPress'
  > {
  /**
   * Custom ref
   */
  ref?: Ref<T>;

  /**
   * Set the default visible state of the modal
   */
  defaultVisible?: boolean;

  /**
   * Whether or not the modal is loading
   */
  loading?: boolean;

  /**
   * Modal title
   */
  title?: ReactNode;

  /**
   * Whether to display the close icon
   */
  closeIconVisible?: boolean;

  /**
   * Whether to display the close button
   */
  closeButtonVisible?: boolean;

  /**
   * Set the icon to close
   */
  closeIcon?: ReactNode;

  /**
   * Disable modal layer close
   */
  disabledModalClose?: boolean;

  /**
   * Call back this function when the modal visible state changes
   */
  onVisible?: (options: ModalOptions<E>) => void;

  /**
   * Call this function when the modal closes
   */
  onClose?: (options: ModalOptions<E>) => void;

  /**
   * Call this function back when you click the modal
   */
  onClick?: (e: ModalClickEvent<T>) => void;

  /**
   * Call this function after pressing the modal
   */
  onTouchEnd?: (e: ModalTouchEvent<T>) => void;

  /**
   * Call this function after pressing the modal -- react native
   */
  onPress?: (e: ModalPressEvent) => void;
}

/**
 * Modal props
 */
export interface ModalProps<T, E> extends BaseModalProps<T, E> {
  /**
   * Render the modal header
   */
  renderHeader?: (props: ModalHeaderProps<T, E>) => ReactNode;

  /**
   * Render the modal main
   */
  renderMain?: (props: ModalMainProps<T, E>) => ReactNode;

  /**
   * Render the modal footer
   */
  renderFooter?: (props: ModalFooterProps<T, E>) => ReactNode;

  /**
   * Render the modal container
   */
  renderContainer?: (props: ModalContainerProps<T, E>) => ReactNode;
}

/**
 * Modal children props
 */
export interface ModalChildrenProps<T, E> extends Omit<BaseModalProps<T, E>, 'icon' | 'ref'> {
  /**
   * Component unique ID
   */
  id: string;
  children?: ReactNode;

  /**
   * Used to handle some common default events
   */
  handleEvent: HandleEvent;
}

export type ModalClickEvent<T> = React.MouseEvent<T, MouseEvent>;
export type ModalTouchEvent<T> = TouchEvent<T>;
export type ModalPressEvent = GestureResponderEvent;

export type ModalHeaderProps<T, E> = ModalChildrenProps<T, E>;
export type ModalMainProps<T, E> = ModalChildrenProps<T, E>;
export type ModalFooterProps<T, E> = ModalChildrenProps<T, E>;
export type ModalContainerProps<T, E> = ModalChildrenProps<T, E> &
  Pick<BaseModalProps<T, E>, 'ref'>;

export interface HandleCallbackOptions {
  checkModalClose?: boolean;
}

function Modal<T, E = ModalClickEvent<T>>({
  ref,
  visible,
  defaultVisible,
  disabledModalClose,
  loading,
  onClick,
  onPress,
  onTouchEnd,
  onVisible,
  onClose,
  renderHeader,
  renderMain,
  renderFooter,
  renderContainer,
  ...props
}: ModalProps<T, E>) {
  const id = useId();
  const [status, setStatus] = useState('idle');
  const [modalOptions, setModalOptions] = useState<ModalOptions<E>>({visible: false});
  const childrenProps = {...props, id, handleEvent};

  const handleModalOptionsChange = useCallback(
    (options: ModalOptions<E>) => {
      onVisible?.(options);
      !options.visible && onClose?.(options);
    },
    [onClose, onVisible],
  );

  function handleCallback<C>(
    callback: (e: C) => void,
    {checkModalClose} = {} as HandleCallbackOptions,
  ) {
    const response = checkModalClose ? !disabledModalClose && !loading : !loading;

    return (e: C) => {
      if (response) {
        const nextVisible = !modalOptions.visible;
        const options = {event: e as C & E, visible: nextVisible};

        setModalOptions(options);
        handleModalOptionsChange(options);
        callback(e);
      }
    };
  }

  const handleClick = (options?: HandleCallbackOptions) =>
    handleCallback((e: ModalClickEvent<T>) => onClick?.(e), options);

  const handleTouchEnd = (options?: HandleCallbackOptions) =>
    handleCallback((e: ModalTouchEvent<T>) => onTouchEnd?.(e), options);

  const handPress = (options?: HandleCallbackOptions) =>
    handleCallback((e: ModalPressEvent) => onPress?.(e), options);

  useEffect(() => {
    const nextVisible = status !== 'idle' ? visible : defaultVisible ?? visible;

    typeof nextVisible === 'boolean' &&
      setModalOptions(currentOptions => {
        const change = currentOptions.visible !== nextVisible && status === 'succeeded';

        change && handleModalOptionsChange({visible: nextVisible});

        return {visible: nextVisible};
      });

    status === 'idle' && setStatus('succeeded');
  }, [defaultVisible, handleModalOptionsChange, status, visible]);

  const getEvent = (options?: HandleCallbackOptions) => ({
    ...(onClick ? {onClick: handleEvent(handleClick(options))} : undefined),
    ...(onTouchEnd ? {onTouchEnd: handleEvent(handleTouchEnd(options))} : undefined),
    ...(onPress ? {onPress: handleEvent(handPress(options))} : undefined),
  });

  const header = renderHeader?.({
    ...childrenProps,
    ...getEvent(),
  });

  const main = renderMain?.({
    ...childrenProps,
    ...getEvent(),
  });

  const footer = renderFooter?.({...childrenProps, ...getEvent()});
  const content = (
    <>
      {header}
      {main}
      {footer}
    </>
  );

  const container =
    renderContainer?.({
      ...childrenProps,
      ...getEvent({checkModalClose: true}),
      children: content,
      ref,
    }) ?? content;

  return <>{container}</>;
}

export default Modal;
