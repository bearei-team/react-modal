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
export interface ModalOptions<E = unknown> extends Pick<BaseModalProps, 'visible'> {
  /**
   * Triggers an event when a modal option changes
   */
  event?: E;
}

/**
 * Base modal props
 */
export interface BaseModalProps<T = HTMLElement>
  extends Omit<
    DetailedHTMLProps<HTMLAttributes<T>, T> & ViewProps,
    'title' | 'onClick' | 'onTouchEnd' | 'onPress'
  > {
  /**
   * Custom ref
   */
  ref?: Ref<T>;

  /**
   * Modal visible state
   */
  visible?: boolean;

  /**
   * The default visible state for the modal
   */
  defaultVisible?: boolean;

  /**
   * Whether the modal is loading
   */
  loading?: boolean;

  /**
   * Modal title
   */
  title?: ReactNode;

  /**
   * Modal size
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Whether the modal close button icon is visible
   */
  closeIconVisible?: boolean;

  /**
   * Modal close button icon
   */
  closeIcon?: ReactNode;

  /**
   * Disable modal layer close
   */
  disabledModalClose?: boolean;

  /**
   * This function is called when the modal visible state changes
   */
  onVisible?: <E>(options: ModalOptions<E>) => void;

  /**
   * This function is called when the modal is closed
   */
  onClose?: <E>(options: ModalOptions<E>) => void;

  /**
   * This function is called when modal is clicked
   */
  onClick?: (e: React.MouseEvent<T, MouseEvent>) => void;

  /**
   * This function is called when the modal is pressed
   */
  onTouchEnd?: (e: TouchEvent<T>) => void;

  /**
   * This function is called when the modal is pressed -- react native
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
   * Render the modal footer
   */
  renderFooter?: (props: ModalFooterProps) => ReactNode;

  /**
   * Render the modal main
   */
  renderMain: (props: ModalMainProps<T>) => ReactNode;

  /**
   * Render the modal container
   */
  renderContainer: (props: ModalContainerProps) => ReactNode;
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
export type ModalFooterProps = ModalChildrenProps;
export interface ModalMainProps<T>
  extends Partial<ModalChildrenProps & Pick<BaseModalProps<T>, 'ref'>> {
  header?: ReactNode;
  footer?: ReactNode;
}

export type ModalContainerProps = ModalChildrenProps;

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
    onVisible,
    onClose,
    onClick,
    onPress,
    onTouchEnd,
    renderHeader,
    renderMain,
    renderFooter,
    renderContainer,
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
    loading,
    defaultVisible,
  };

  const handleModalOptionsChange = useCallback(
    <E,>(options: ModalOptions<E>) => {
      onVisible?.(options);
      !options.visible && onClose?.(options);
    },
    [onClose, onVisible],
  );

  const handleResponse = <E,>(e: E, {checkModalClose, callback}: HandleResponseOptions<E>) => {
    const isResponse = checkModalClose ? !disabledModalClose && !loading : !loading;

    if (isResponse) {
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
        const isUpdate = currentOptions.visible !== nextVisible && status === 'succeeded';

        isUpdate && handleModalOptionsChange({visible: nextVisible});

        return {visible: nextVisible};
      });

    status === 'idle' && setStatus('succeeded');
  }, [defaultVisible, handleModalOptionsChange, status, visible]);

  const event = bindEvents(events, handleCallback());
  const header = renderHeader?.({
    ...childrenProps,
    ...event,
  });

  const footer = renderFooter?.({...childrenProps, ...event});
  const main = renderMain({
    ...childrenProps,
    ref,
    header,
    footer,
    ...bindEvents(events, handleCallback(true)),
  });

  const container = renderContainer({
    ...childrenProps,
    children: main,
  });

  return <>{container}</>;
};

export default Modal;
