# react-modal

Base modal components that support React and React native

## Installation

> yarn add @bearei/react-modal --save

## Parameters

| Name | Type | Required | Description |
| :-- | --: | --: | :-- |
| defaultVisible | `boolean` | ✘ | Set the default visible state of the modal |
| loading | `boolean` | ✘ | Whether or not the modal is loading |
| title | `ReactNode` | ✘ | Modal title |
| closeIconVisible | `boolean` | ✘ | Whether to display the close icon |
| closeButtonVisible | `boolean` | ✘ | Whether to display the close button |
| closeIcon | `ReactNode` | ✘ | Set the icon to close |
| disabledModalClose | `boolean` | ✘ | Disable modal layer close |
| size | `small` `medium` `large` | ✘ | Set the modal size |
| event | `onClick` `onTouchEnd` `onPress` | ✘ | Modal binding event name |
| onVisible | `(options: ModalOptions) => void` | ✘ | Call back this function when the modal visible state changes |
| onClose | `(options: ModalOptions) => void` | ✘ | Call this function when the modal closes |
| renderHeader | `(props: ModalHeaderProps) => ReactNode` | ✘ | Render the modal header |
| renderMain | `(props: ModalMainProps) => ReactNode` | ✘ | Render the modal main |
| renderFooter | `(props: ModalFooterProps) => ReactNode` | ✘ | Render the modal footer |
| renderContainer | `(props: ModalContainerProps) => ReactNode` | ✘ | Render the modal container |

## Use

```typescript
import React from 'React';
import ReactDOM from 'react-dom';
import Modal from '@bearei/react-modal';

const modal = (
  <Modal<HTMLDivElement>
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
  />
);

ReactDOM.render(modal, container);
```
