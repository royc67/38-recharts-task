import React from 'react'
import "./App.css";
import { useState, useEffect } from "react";
import axios from "axios";
import {
	LineChart,
	Line,
	CartesianGrid,
	XAxis,
	YAxis,
	Tooltip,
	Legend,
} from "recharts";
import Select from "react-select";

function App() {
  const [covidData, setCovidData] = useState([]);
	const [chartData, setChartData] = useState([]);
	const [selectArr, setSelectArr] = useState([]);
	const [firstCountry, setFirstCountry] = useState();
	const [secondCountry, setSecondCountry] = useState();

	const csvtoJSON = (csv) => {
		var lines = csv.split("\n");

		var result = [];

		// NOTE: If your columns contain commas in their values, you'll need
		// to deal with those before doing the next step
		// (you might convert them to &&& or something, then covert them back later)
		// jsfiddle showing the issue https://jsfiddle.net/
		var headers = lines[0].split(",");

		for (var i = 1; i < lines.length; i++) {
			var obj = {};
			var currentline = lines[i].split(",");

			for (var j = 0; j < headers.length; j++) {
				obj[headers[j]] = currentline[j];
			}

			result.push(obj);
		}

		//return result; //JavaScript object
		return result; //JSON
	};

	useEffect(() => {
		const getData = async () => {
			const { data } = await axios.get(
				"https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv"
			);
			const newData = csvtoJSON(data);
			const finalData = newData.map((country) => {
				if (country["Province/State"] === "") {
					country["Province/State"] = country["Country/Region"];
				}
				const countryObj = {
					name: country["Province/State"],
					tempData: country,
				};
				delete countryObj.tempData["Province/State"];
				delete countryObj.tempData["Country/Region"];
				delete countryObj.tempData.Lat;
				delete countryObj.tempData.Long;

				countryObj.data = [];
				for (let date in countryObj.tempData) {
					countryObj.data.push({
						date: date,
						confirmed: parseInt(countryObj.tempData[date]),
					});
				}
				delete countryObj.tempData;
				return countryObj;
			});
			// console.log("countries", finalData);
			setCovidData(finalData);

			let tempSelectArr = finalData.map((country) => {
				if (country?.name?.includes('"')) {
					country.name = country.name.replace('"', "");
				}
				return {
					value: country.data,
					label: country.name,
				};
			});
			tempSelectArr.sort((a, b) => {
				if (a.label < b.label) return -1;
				if (a.label > b.label) return 1;
				return 0;
			});
			setSelectArr(tempSelectArr);
		};
		getData();
	}, []);

	useEffect(() => {
		if (!firstCountry || !secondCountry) return;
		const tempFirstArr = firstCountry.value.map((dayInfo) => {
			return {
				date: dayInfo.date,
				firstCountryName: firstCountry.label,
				firstCountryConfirmed: dayInfo.confirmed,
			};
		});
		const tempSecondArr = secondCountry.value.map((dayInfo) => {
			return {
				date: dayInfo.date,
				secondCountryName: secondCountry.label,
				secondCountryConfirmed: dayInfo.confirmed,
			};
		});
		console.log("first", tempFirstArr);
		console.log("second", tempSecondArr);
		const tempChartData = tempFirstArr.map((first) => {
			tempSecondArr.forEach((second) => {
				if (first.date === second.date) {
					first = {
						...first,
						...second,
					};
				}
			});
			return first;
		});
		console.log("chart", tempChartData);
		setChartData(tempChartData);
	}, [firstCountry, secondCountry]);

	const handleFirstSelectChange = (value) => {
		setFirstCountry(value);
	};

	const handleSecondSelectChange = (value) => {
		setSecondCountry(value);
  };
  
  return (
    <div className="App">
        <Select
				value={firstCountry}
				onChange={handleFirstSelectChange}
				options={selectArr}
			/>
			<Select
				value={secondCountry}
				onChange={handleSecondSelectChange}
				options={selectArr}
			/>
			<LineChart
				width={600}
				height={300}
				data={chartData}
				margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
			>
				<Line
					name={chartData[0]?.firstCountryName}
					type="monotone"
					dataKey="firstCountryConfirmed"
					stroke="#8884d8"
				/>
				<Line
					name={chartData[0]?.secondCountryName}
					type="monotone"
					dataKey="secondCountryConfirmed"
					stroke="#8884d8"
				/>
				<CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
				<XAxis dataKey="date" />
				<YAxis />
				<Tooltip />
				<Legend />
			</LineChart>
    </div>
  );
}

export default App;
