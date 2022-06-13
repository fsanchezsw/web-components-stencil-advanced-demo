import { h, Component, State, Event, EventEmitter } from '@stencil/core';
import { AV_API_KEY } from '../../global/global';

@Component({
  tag: 'uc-stock-finder',
  styleUrl: './stock-finder.css',
  shadow: true,
})
export class StockFinder {
  nameInput: HTMLInputElement;

  @State() stocks: { symbol: string; name: string }[] = [];

  @State() loading = false;

  // TODO: research about @Event options
  @Event({ bubbles: true, composed: true }) ucStockSymbolSelected: EventEmitter<string>;

  onSubmit(event: Event) {
    event.preventDefault();

    this.loading = true;

    const name = this.nameInput.value;
    this.getStocks(name)
      .then(stocks => (this.stocks = stocks))
      .catch(console.log)
      .finally(() => (this.loading = false));
  }

  onSelectStock(stock: { symbol: string; name: string }) {
    this.ucStockSymbolSelected.emit(stock.symbol);
  }

  private getStocks(name: string): Promise<{ symbol: string; name: string }[]> {
    return fetch(`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${name}&apikey=${AV_API_KEY}`)
      .then(res => res.json())
      .then(response => response['bestMatches'].map(match => ({ symbol: match['1. symbol'], name: match['2. name'] })));
  }

  render() {
    const stocksContent = this.loading ? (
      <uc-loading-spinner />
    ) : (
      <ul>
        {this.stocks.map(stock => (
          <li onClick={this.onSelectStock.bind(this, stock)}>
            <b>{stock.symbol}</b> - {stock.name}
          </li>
        ))}
      </ul>
    );

    return [
      <form onSubmit={this.onSubmit.bind(this)}>
        <input id="stock-name" ref={el => (this.nameInput = el)} />
        <button type="submit">Find</button>
      </form>,
      stocksContent,
    ];
  }
}
