# react-modal

Base modal components that support React and React native

## Installation

> yarn add @bearei/react-modal --save

## Parameters

| Name | Type | Required | Description |
| :-- | --: | --: | :-- |
| visible | `boolean` | ✘ | Modal visible state |
| defaultVisible | `boolean` | ✘ | The default visible state for the modal |
| loading | `boolean` | ✘ | Whether the modal is loading |
| title | `ReactNode` | ✘ | Modal title |
| header | `ReactNode` | ✘ | Modal header |
| footer | `ReactNode` | ✘ | Modal footer |
| content | `ReactNode` | ✘ | Modal content |
| size | `small` `medium` `large` | ✘ | Modal size |
| padding | `boolean` | ✘ | Set the content area to fill |
| closeIcon | `ReactNode` | ✘ | Modal close button icon |
| disabledModalClose | `boolean` | ✘ | Disable modal layer close |
| onVisible | `(options: ModalOptions) => void` | ✘ | This function is called when the modal visible state changes |
| onClose | `(options: ModalOptions) => void` | ✘ | This function is called when the modal is closed |
| onClick | `(options: React.MouseEvent) => void` | ✘ | This function is called when modal is clicked |
| onTouchEnd | `(options: React.TouchEvent) => void` | ✘ | This function is called when the modal is pressed |
| onPress | `(options: GestureResponderEvent) => void` | ✘ | This function is called when the modal is pressed -- react native |
| renderHeader | `(props: ModalHeaderProps) => ReactNode` | ✘ | Render the modal header |
| renderFooter | `(props: ModalFooterProps) => ReactNode` | ✘ | Render the modal footer |
| renderMain | `(props: ModalMainProps) => ReactNode` | ✔ | Render the modal main |
| renderContainer | `(props: ModalContainerProps) => ReactNode` | ✔ | Render the modal container |

## Use

```typescript
import React from 'React';
import ReactDOM from 'react-dom';
import Modal from '@bearei/react-modal';

const modal = (
  <Modal
    renderMain={({ ...props }) => <div {...props}>"modal"</div>}
    renderContainer={({ id, children }) => <div data-id={id}>{children}</div>}
  />
);

ReactDOM.render(modal, container);
```
