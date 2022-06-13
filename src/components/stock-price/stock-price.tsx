import { h, Component, State, Prop, Watch, Listen } from '@stencil/core';
import { AV_API_KEY } from '../../global/global';

@Component({
  tag: 'uc-stock-price',
  styleUrls: ['./stock-price.css', '../../global/styles/loading-spinner.css'],
  shadow: true,
})
export class StockPrice {
  // 1. Element approach, maybe for using with many query selectors at a time
  // @Element() el: HTMLElement;

  // 2. Reference approach
  symbolInput: HTMLInputElement;

  @State() price: number;

  @State() stockSymbolInput: string;
  @State() stockSymbolInputValid = false;

  @State() formError: string;

  @State() loading = false;

  // Stock symbol from outside our web component
  @Prop() stockSymbol: string;

  @Watch('stockSymbol')
  onStockSymbolChanged(value: string, oldValue: string) {
    if (value !== oldValue) {
      this.updateStockPrice(value);
    }
  }

  // Lifecycle hook
  componentDidLoad(): Promise<void> {
    if (!this.stockSymbol) return;

    return this.updateStockPrice(this.stockSymbol);
  }

  // `componentWillUpdate` approach: not convenient, use @Watch decorator instead
  // componentWillUpdate(): Promise<void> {
  //   return this.updateStockPrice();
  // }

  @Listen('ucStockSymbolSelected', { target: 'body' })
  onStockSymbolSelected(event: CustomEvent) {
    const symbol = event.detail;

    if (symbol && symbol !== this.stockSymbol) {
      this.stockSymbol = symbol;
    }
  }

  onStockSymbolInput(event: Event) {
    this.stockSymbolInput = (event.target as HTMLInputElement).value;

    // Validation
    this.stockSymbolInputValid = this.stockSymbolInput.trim() !== '';
  }

  onSubmit(event: Event) {
    event.preventDefault();

    // 1. Element approach
    // const symbol = (this.el.shadowRoot.querySelector('#stock-symbol') as HTMLInputElement).value;

    // 2. Reference approach
    // const symbol = this.symbolInput.value;

    // this.fetchStockPrice(symbol);

    this.stockSymbol = this.symbolInput.value;
  }

  private updateStockPrice(symbol: string): Promise<void> {
    this.stockSymbolInput = symbol;
    this.stockSymbolInputValid = true;

    // Returning a promise because `render()` will wait for this promise
    return this.fetchStockPrice(symbol);
  }

  private fetchStockPrice(symbol: string): Promise<void> {
    this.loading = true;

    return this.getStockPrice(symbol)
      .then(price => {
        if (!price) {
          throw new Error('Invalid symbol!');
        }

        this.price = price;
        this.formError = null;
      })
      .catch(err => {
        this.formError = err.message;
        this.price = null;
      })
      .finally(() => (this.loading = false));
  }

  private getStockPrice(symbol: string): Promise<number> {
    return fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${AV_API_KEY}`)
      .then(res => res.json())
      .then(response => +response['Global Quote']['05. price']);
  }

  // Preserved method
  hostData() {
    return { class: this.formError ? 'error' : '' };
  }

  render() {
    let priceContent = <p>Please enter a symbol.</p>;

    if (this.formError) {
      priceContent = <p>{this.formError}</p>;
    }

    if (this.price) {
      priceContent = <p>Price: ${this.price}</p>;
    }

    if (this.loading) {
      priceContent = <uc-loading-spinner />;
    }

    return [
      <form onSubmit={this.onSubmit.bind(this)}>
        <input id="stock-symbol" ref={el => (this.symbolInput = el)} value={this.stockSymbolInput} onInput={this.onStockSymbolInput.bind(this)} />
        <button type="submit" disabled={!this.stockSymbolInputValid || this.loading}>
          Fetch
        </button>
      </form>,
      <div class="price-content">{priceContent}</div>,
    ];
  }
}
