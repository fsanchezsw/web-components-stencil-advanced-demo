import { h, Component } from '@stencil/core';

@Component({
  tag: 'uc-loading-spinner',
  styleUrl: './loading-spinner.css',
  shadow: true,
})
export class LoadingSpinner {
  render() {
    return (
      <div class="lds-ellipsis">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    );
  }
}
