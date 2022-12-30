import {
  bindEvents,
  handleDefaultEvent,
} from '@bearei/react-util/lib/commonjs/event';
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
import type { GestureResponderEvent, ViewProps } from 'react-native';

/**
 * Modal options
 */
export interface ModalOptions<T, E = unknown>
  extends Pick<BaseModalProps<T>, 'visible'> {
  /**
   * Triggers an event when a modal option changes
   */
  event?: E;
}

/**
 * Base modal props
 */
export interface BaseModalProps<T>
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
  onVisible?: <E>(options: ModalOptions<T, E>) => void;

  /**
   * This function is called when the modal is closed
   */
  onClose?: <E>(options: ModalOptions<T, E>) => void;

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
  renderHeader?: (props: ModalHeaderProps<T>) => ReactNode;

  /**
   * Render the modal footer
   */
  renderFooter?: (props: ModalFooterProps<T>) => ReactNode;

  /**
   * Render the modal main
   */
  renderMain: (props: ModalMainProps<T>) => ReactNode;

  /**
   * Render the modal container
   */
  renderContainer: (props: ModalContainerProps<T>) => ReactNode;
}

/**
 * Modal children props
 */
export interface ModalChildrenProps<T> extends Omit<BaseModalProps<T>, 'ref'> {
  /**
   * Component unique ID
   */
  id: string;
  children?: ReactNode;
}

export type ModalHeaderProps<T> = ModalChildrenProps<T>;
export type ModalFooterProps<T> = ModalChildrenProps<T>;
export interface ModalMainProps<T>
  extends Partial<ModalChildrenProps<T> & Pick<BaseModalProps<T>, 'ref'>> {
  header?: ReactNode;
  footer?: ReactNode;
}

export type ModalContainerProps<T> = ModalChildrenProps<T>;

const Modal = <T extends HTMLElement = HTMLElement>(props: ModalProps<T>) => {
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
  const [modalOptions, setModalOptions] = useState<ModalOptions<T>>({
    visible: false,
  });

  const events = Object.keys(props).filter(key => key.startsWith('on'));
  const childrenProps = {
    ...args,
    id,
    visible,
    loading,
    defaultVisible,
  };

  const handleModalOptionsChange = useCallback(
    <E,>(options: ModalOptions<T, E>) => {
      onVisible?.(options);
      !options.visible && onClose?.(options);
    },
    [onClose, onVisible],
  );

  const handleResponse = <E,>(e: E, callback?: (e: E) => void) => {
    const isResponse =
      typeof disabledModalClose === 'boolean'
        ? !disabledModalClose && !loading
        : !loading;

    if (isResponse) {
      const nextVisible = !modalOptions.visible;
      const options = { event: e, visible: nextVisible };

      setModalOptions(options);

      handleModalOptionsChange(options);
      callback?.(e);
    }
  };

  const handleCallback = (key: string) => {
    const event = {
      onClick: handleDefaultEvent((e: React.MouseEvent<T, MouseEvent>) =>
        handleResponse(e, onClick),
      ),
      onTouchEnd: handleDefaultEvent((e: TouchEvent<T>) =>
        handleResponse(e, onTouchEnd),
      ),
      onPress: handleDefaultEvent((e: GestureResponderEvent) =>
        handleResponse(e, onPress),
      ),
    };

    return event[key as keyof typeof event];
  };

  useEffect(() => {
    const nextVisible = status !== 'idle' ? visible : defaultVisible ?? visible;

    typeof nextVisible === 'boolean' &&
      setModalOptions(currentOptions => {
        const isUpdate =
          currentOptions.visible !== nextVisible && status === 'succeeded';

        isUpdate && handleModalOptionsChange({ visible: nextVisible });

        return { visible: nextVisible };
      });

    status === 'idle' && setStatus('succeeded');
  }, [defaultVisible, handleModalOptionsChange, status, visible]);

  const event = bindEvents(events, handleCallback);
  const header = renderHeader?.({
    ...childrenProps,
    ...event,
  });

  const footer = renderFooter?.({ ...childrenProps, ...event });
  const main = renderMain({
    ...childrenProps,
    ref,
    header,
    footer,
    ...event,
  });

  const container = renderContainer({
    ...childrenProps,
    children: main,
  });

  return <>{container}</>;
};

export default Modal;
