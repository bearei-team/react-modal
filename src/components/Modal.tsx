import {
  bindEvents,
  handleDefaultEvent,
} from '@bearei/react-util/lib/commonjs/event';
import {
  DetailedHTMLProps,
  HTMLAttributes,
  MouseEvent,
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
   * Modal header
   */
  header?: ReactNode;

  /**
   * Modal footer
   */
  footer?: ReactNode;

  /**
   * Modal content
   */
  content?: ReactNode;

  /**
   * Modal size
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Modal close button icon
   */
  closeIcon?: ReactNode;

  /**
   * Disable modal layer close
   */
  disabledModalClose?: boolean;

  /**
   * Set the content area to fill
   */
  padding?: boolean;

  /**
   * This function is called when the modal visible state changes
   */
  onVisible?: () => void;

  /**
   * This function is called when the modal is closed
   */
  onClose?: () => void;

  /**
   * This function is called when modal is clicked
   */
  onClick?: (e: MouseEvent<T>) => void;

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
   * Render the modal main
   */
  renderMain: (props: ModalMainProps<T>) => ReactNode;

  /**
   * Render the modal footer
   */
  renderFooter?: (props: ModalFooterProps<T>) => ReactNode;

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
}

export type ModalHeaderProps<T> = ModalChildrenProps<T>;
export type ModalFooterProps<T> = ModalChildrenProps<T>;
export type ModalMainProps<T> = ModalChildrenProps<T> &
  Pick<BaseModalProps<T>, 'ref'>;

export type ModalContainerProps<T> = ModalChildrenProps<T>;
export type EventType = 'onClick' | 'onPress' | 'onTouchEnd';

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
  const [modalVisible, setModalVisible] = useState(false);

  const bindEvenNames = ['onClick', 'onPress', 'onTouchEnd'];
  const eventNames = Object.keys(props).filter(key =>
    bindEvenNames.includes(key),
  ) as EventType[];

  const childrenProps = {
    ...args,
    id,
    visible,
    loading,
    defaultVisible,
  };

  const handleModalOptionsChange = useCallback(
    (visible: boolean) => {
      visible ? onVisible?.() : onClose?.();
    },
    [onClose, onVisible],
  );

  const handleResponse = <E,>(e: E, callback?: (e: E) => void) => {
    const isResponse =
      typeof disabledModalClose === 'boolean'
        ? !disabledModalClose && !loading
        : !loading;

    if (isResponse) {
      setModalVisible(modalVisible);
      handleModalOptionsChange(modalVisible);
      callback?.(e);
    }
  };

  const handleCallback = (event: EventType) => {
    const eventFunctions = {
      onClick: handleDefaultEvent((e: MouseEvent<T>) =>
        handleResponse(e, onClick),
      ),
      onTouchEnd: handleDefaultEvent((e: TouchEvent<T>) =>
        handleResponse(e, onTouchEnd),
      ),
      onPress: handleDefaultEvent((e: GestureResponderEvent) =>
        handleResponse(e, onPress),
      ),
    };

    return eventFunctions[event];
  };

  useEffect(() => {
    const nextVisible = status !== 'idle' ? visible : defaultVisible ?? visible;

    if (typeof nextVisible === 'boolean') {
      setModalVisible(currentlyVisible => {
        const isUpdate = currentlyVisible !== nextVisible;

        return isUpdate ? { visible: nextVisible } : nextVisible;
      });
    }

    status === 'idle' && setStatus('succeeded');
  }, [defaultVisible, status, visible]);

  const events = bindEvents(eventNames, handleCallback) as {
    onClick?: (e: MouseEvent<T>) => void;
    onTouchEnd?: (e: TouchEvent<T>) => void;
    onPress?: (e: GestureResponderEvent) => void;
  };

  const header = renderHeader?.({ ...childrenProps, ...events });
  const footer = renderFooter?.({ ...childrenProps, ...events });
  const main = renderMain({
    ...childrenProps,
    ref,
    header,
    footer,
    ...events,
  });

  const container = renderContainer({ ...childrenProps, children: main });

  return <>{container}</>;
};

export default Modal;
