import { useEffect } from 'react';
// import {
// 	LineChart,
// 	Line,
// 	CartesianGrid,
// 	XAxis,
// 	YAxis,
// 	Tooltip,
// 	Legend,
// } from "recharts";
import axios from 'axios'
import React from 'react'

function CovidCharts(props){

    useEffect(async ()=>{
        await axios(
            "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv"
        ).then(res=>{
            console.log(res)
        }).catch(err => {
            console.log(err.message)
        })
    }
    )

    return (
        <>
         Shalom
        </>
    )
}

export default CovidCharts;