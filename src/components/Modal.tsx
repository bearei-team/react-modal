import {bindEvents, handleDefaultEvent} from '@bearei/react-util/lib/event';
import {
  DetailedHTMLProps,
  HTMLAttributes,
  ReactNode,
  Ref,
  TouchEvent,
  useCallback,
  useEffect,
  useId,
  useState,
} from 'react';
import type {GestureResponderEvent, ViewProps} from 'react-native';

/**
 * Modal options
 */
export interface ModalOptions<E = unknown> {
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
export interface BaseModalProps<T = HTMLElement>
  extends Omit<
    DetailedHTMLProps<HTMLAttributes<T>, T> & ViewProps & Pick<ModalOptions, 'visible'>,
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
   * Set the modal size
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Whether to display the close icon
   */
  closeIconVisible?: boolean;

  /**
   * Whether to display the close modal
   */
  closeModalVisible?: boolean;

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
  onVisible?: <E>(options: ModalOptions<E>) => void;

  /**
   * Call this function when the modal closes
   */
  onClose?: <E>(options: ModalOptions<E>) => void;

  /**
   * Call this function back when you click the modal
   */
  onClick?: (e: React.MouseEvent<T, MouseEvent>) => void;

  /**
   * Call this function after pressing the modal
   */
  onTouchEnd?: (e: TouchEvent<T>) => void;

  /**
   * Call this function after pressing the modal -- react native
   */
  onPress?: (e: GestureResponderEvent) => void;
}

/**
 * Modal props
 */
export interface ModalProps<T> extends BaseModalProps<T> {
  /**
   * Render the modal header
   */
  renderHeader?: (props: ModalHeaderProps) => ReactNode;

  /**
   * Render the modal main
   */
  renderMain?: (props: ModalMainProps) => ReactNode;

  /**
   * Render the modal footer
   */
  renderFooter?: (props: ModalFooterProps) => ReactNode;

  /**
   * Render the modal container
   */
  renderContainer?: (props: ModalContainerProps<T>) => ReactNode;
}

/**
 * Modal children props
 */
export interface ModalChildrenProps extends Omit<BaseModalProps, 'ref'> {
  /**
   * Component unique ID
   */
  id: string;
  children?: ReactNode;
}

export type ModalHeaderProps = ModalChildrenProps;
export type ModalMainProps = ModalChildrenProps;
export type ModalFooterProps = ModalChildrenProps;
export type ModalContainerProps<T> = ModalChildrenProps & Pick<BaseModalProps<T>, 'ref'>;

export interface HandleResponseOptions<E> {
  checkModalClose?: boolean;
  callback?: (e: E) => void;
}

const Modal = <T extends HTMLElement>(props: ModalProps<T>) => {
  const {
    ref,
    visible,
    loading,
    defaultVisible,
    disabledModalClose,
    renderHeader,
    renderMain,
    renderFooter,
    renderContainer,
    onVisible,
    onClose,
    onClick,
    onPress,
    onTouchEnd,
    ...args
  } = props;

  const id = useId();
  const [status, setStatus] = useState('idle');
  const [modalOptions, setModalOptions] = useState<ModalOptions>({visible: false});
  const events = Object.keys(props).filter(key => key.startsWith('on'));
  const childrenProps = {
    ...args,
    id,
    visible,
    defaultVisible,
    loading,
  };

  const handleModalOptionsChange = useCallback(
    <E,>(options: ModalOptions<E>) => {
      onVisible?.(options);
      !options.visible && onClose?.(options);
    },
    [onClose, onVisible],
  );

  const handleResponse = <E,>(e: E, {checkModalClose, callback}: HandleResponseOptions<E>) => {
    const response = checkModalClose ? !disabledModalClose && !loading : !loading;

    if (response) {
      const nextVisible = !modalOptions.visible;
      const options = {event: e, visible: nextVisible};

      setModalOptions(options);
      handleModalOptionsChange(options);
      callback?.(e);
    }
  };

  const handleCallback = (checkModalClose?: boolean) => (key: string) => {
    const options = {checkModalClose};
    const event = {
      onClick: handleDefaultEvent((e: React.MouseEvent<T, MouseEvent>) =>
        handleResponse(e, {...options, callback: onClick}),
      ),
      onTouchEnd: handleDefaultEvent((e: TouchEvent<T>) =>
        handleResponse(e, {...options, callback: onTouchEnd}),
      ),
      onPress: handleDefaultEvent((e: GestureResponderEvent) =>
        handleResponse(e, {...options, callback: onPress}),
      ),
    };

    return event[key as keyof typeof event];
  };

  useEffect(() => {
    const nextVisible = status !== 'idle' ? visible : defaultVisible ?? visible;

    typeof nextVisible === 'boolean' &&
      setModalOptions(currentOptions => {
        const update = currentOptions.visible !== nextVisible && status === 'succeeded';

        update && handleModalOptionsChange({visible: nextVisible});

        return {visible: nextVisible};
      });

    status === 'idle' && setStatus('succeeded');
  }, [defaultVisible, handleModalOptionsChange, status, visible]);

  const event = bindEvents(events, handleCallback());
  const header = renderHeader?.({
    ...childrenProps,
    ...event,
  });

  const main = renderMain?.(childrenProps);
  const footer = renderFooter?.({...childrenProps, ...event});
  const content = (
    <>
      {header}
      {main}
      {footer}
    </>
  );

  const container = renderContainer?.({
    ...childrenProps,
    children: content,
    ref,
    ...bindEvents(events, handleCallback(true)),
  });

  return <>{container}</>;
};

export default Modal;
