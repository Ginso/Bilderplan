import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import Bilderplan from './pages/bilderplan.js'
import './style.scss';
import {
	HashRouter as Router,
	Routes,
	Route,
	Navigate
} from "react-router-dom";
import {useSelector, useDispatch} from 'react-redux'
import {getSession, setTeam, setTab, setUploading, setShowDialog, setCurrBildIdx, setEditMode, setUnit, setSelectedPoints, setAnimated, setSelMode, setRotated} from './utils/redux'
import {getPersistentStorage, storePlan, storePlanOriginal, setPosition, setPart, updatePlan} from './utils/redux'
import { checkUrlForQuery } from './utils/utils'

function App() {
	const glob = {...useSelector(getPersistentStorage), ...useSelector(getSession)};
	console.log(glob)


  return (
    <div className="App">
			<Router>
				<Routes>
					<Route path="/:team" element={<Bilderplan/>}></Route>
					<Route path="/" element={<Bilderplan/>}></Route>
				</Routes>
			</Router>
    </div>
  );
}

export default App;
