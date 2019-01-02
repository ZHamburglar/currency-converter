import React, { Component } from 'react';
import fx from 'money';
import './App.css';

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			loading: true,
			error: false,
			errorMessage: '',
			firstAmount: '',
			firstRaw: '',
			secondAmount: '',
			firstCurrency: 'USD',
			secondCurrency: 'USD',
			firstSymbol: '$',
			secondSymbol: '$',
			currencyList: null,
			conversionRate: null
		};
	}

	componentDidMount () {
		this.getCurrencies();
	}

	renderErrorMessage() {
		const { error, errorMessage } = this.state;
		if (error) {
			return <div>{errorMessage}</div>;
		}
	}

	currencyConversion() {
		const { conversionRate, firstCurrency, secondCurrency, firstRaw, secondSymbol } = this.state;
		fx.base = conversionRate.base;
		fx.rates = conversionRate.rates;
		if (!fx.rates[firstCurrency] || !fx.rates[secondCurrency]) {
			this.setState({
				error: true,
				errorMessage: '>>> You have picked an invalid currency! <<<'
			});
		} else if (firstRaw.length === 0) {
			this.setState({
				error: false,
				errorMessage: ''
			});
		} else {
			const firstSplit = firstRaw.match(/([a-zA-Z]*)([0-9\.]+)/)[2];
			const conCurrency = fx.convert(firstSplit, { from: firstCurrency, to: secondCurrency });
			let fixed = Number(conCurrency).toFixed(2);
			this.setState({
				error: false,
				errorMessage: '',
				secondAmount: secondSymbol + fixed
			});
		}
	}

	currencyInput = (e) => {
		const { firstSymbol } = this.state;
		let formInput;
		if (e.target.value.length === 1) {
			e.target.value = '0'+e.target.value;
		}
		formInput = parseFloat(e.target.value.replace(/[^\d]/g,'').replace(/(\d\d?)$/,'.$1')).toFixed(2);
		this.setState({
			firstAmount: firstSymbol + formInput,
			firstRaw: formInput
		}, this.currencyConversion);
	}

	changeFirstCurrency = (e) => {
		const { currencyList, firstAmount, firstRaw } = this.state;
		const getSymbol = currencyList.find((sym) => sym.code === e.target.value);
		if (firstAmount) {
			this.setState({
				firstAmount: getSymbol.symbol_native + firstRaw
			});
		}
		this.setState({
			firstCurrency: e.target.value,
			firstSymbol: getSymbol.symbol_native
		}, this.currencyConversion);
	}

	changeSecondCurrency = (e) => {
		const { currencyList } = this.state;
		let getSymbol = currencyList.find((sym) => sym.code === e.target.value);
		this.setState({
			secondCurrency: e.target.value,
			secondSymbol: getSymbol.symbol_native
		}, this.currencyConversion);
	}

	getCurrencies() {
		const urls = [
			"https://gist.githubusercontent.com/mddenton/062fa4caf150bdf845994fc7a3533f74/raw/27beff3509eff0d2690e593336179d4ccda530c2/Common-Currency.json",
			"http://data.fixer.io/api/latest?access_key=d0f3b7da0757140a192df5c5ee3fd3cf"
		];
		Promise.all(urls.map((url) =>
			fetch(url)
				.then((res) => {
					return(res.json());
				})
				.catch((err) =>{
					console.err("error: ", err);
				})
		)).then((data) => {
			const currencies = Object.values(data[0]);
			this.setState({
				currencyList: currencies,
				conversionRate: data[1],
				loading: false
			});
		});

	};

	render() {
		const { loading, firstAmount, secondAmount, firstCurrency, secondCurrency, currencyList, conversionRate } = this.state;
		if (loading) {
			return (
				<div className="App">
					LOADING DATA
				</div>
			);
		}

		if (currencyList && conversionRate) {
			return (
				<div className="App">
					There is data! Convert now!
					<form>
						<label>
							From:
							<input type="text" name="firstC" placeholder="Enter Amount Here" autoFocus value ={firstAmount} onChange={this.currencyInput} />
						</label>
						<select value={firstCurrency} onChange={this.changeFirstCurrency}>
							{currencyList.map((currency, i) => <option key={i} value={currency.code}>{currency.name} ({currency.symbol_native})</option>)}
						</select>
						<label>
							To:
							<input type="text" name="secondC" value ={secondAmount} readOnly />
						</label>
						<select value={secondCurrency} onChange={this.changeSecondCurrency}>
							{currencyList.map((currency, i) => <option key={currencyList.length + i} value={currency.code}>{currency.name} ({currency.symbol_native})</option>)}
						</select>
					</form>
					{this.renderErrorMessage()}
				</div>
			);
		}

		return (
			<div className="App">
				Some kind of error, please refresh
			</div>
		);
	}
}

export default App;
