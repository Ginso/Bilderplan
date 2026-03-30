import React, { useState, useEffect, useRef } from 'react';
import * as ReactDOM from 'react-dom/client';
import {Link, useParams, useNavigate} from "react-router-dom";
import {useSelector, useDispatch} from 'react-redux'

import {queryPHP, postPHP, MyInput, MySelect, utils} from '../utils/utils'
import {getSession, setTeam, setTab, setUploading, setShowDialog, setCurrBildIdx, setEditMode, setUnit, setSelectedPoints, setAnimated, setSelMode, setRotated} from '../utils/redux'
import {getPersistentStorage, storePlan, storePlanOriginal, setPosition, setPart, updatePlan} from '../utils/redux'
import { DialogManager, openDialog } from './components/dialog';
import TabTable from './tabs/tabTable'
import TabBild from './tabs/tabBild'
import TabInfo from './tabs/tabInfo'

export default function Bilderplan(props) {
	let params = useParams();
	const param = (params.team ?? '').toLowerCase()
	const dispatch = useDispatch()

	const glob = {...useSelector(getPersistentStorage), ...useSelector(getSession)};

	const windowSize = useRef([window.innerWidth, window.innerHeight]);
	useEffect(() => {
		dispatch(setTeam(param));
		let unit = Math.min(windowSize.current[0]-80, windowSize.current[1]-300)/16
		dispatch(setUnit(unit))
	}, [param]);


	useEffect(() => {
		queryPHP("formationBilder", {team:glob.team}, data => {
			let loaded = new Date().toLocaleTimeString()
			let plan = {...data, loaded}
			let maxId = plan.bilder.reduce((c,i) => Math.max(c, i.id), 0)
			plan.maxId = maxId
			dispatch(storePlanOriginal({team:glob.team, plan}))
			dispatch(storePlan({team:glob.team, plan}))
		});
	}, [glob.team])

	if (glob.team !== param) return <div></div>; // beim ersten aufruf ist das team noch nicht gesetzt

	const upload = () => {
		let copy = structuredClone(glob.plan)
		for(let i = 0; i < copy.bilder.length-1; i++) {
			let bild = copy.bilder[i]
			if(bild.comment) bild.comment = bild.comment.trim()
		}
		let json = JSON.stringify(copy.bilder).replaceAll("\\n", "\\\\n")
		dispatch(setUploading(true))
		postPHP("uploadFormationBilder",{json, pairs:copy.pairs, team:glob.team}, res=>{
			copy.id=res
			copy.changed=false
			copy.saved = new Date().toLocaleString()
			dispatch(storePlanOriginal({team:glob.team, plan: copy}))
			dispatch(storePlan({team:glob.team, plan: copy}))
			dispatch(setUploading(false))
		}, err=>{
			alert("Fehler beim upload: " + err)
			console.log("ERR", err)
			dispatch(setUploading(false))
		});
	}


	const discard = () => {
		openDialog("Alle Änderungen verwerfen?", () => {
			dispatch(storePlan({team: glob.team, plan: {
				id: glob.planOriginal.id,
				pairs: glob.planOriginal.pairs,
				changed: false,
				bilder: glob.planOriginal.bilder
			}}))
			dispatch(setSelMode(0))
		});
	}

	return (<div id="bilderplan" className={glob.unit < 7 ? 'mobile' : ''}>
		<header style={{ padding: '10px', background: '#f0f0f0', borderBottom: '1px solid #ccc' }}>
			<h1 style={{ margin: 0 }}>
				{glob.team === '' ? 'Testumgebung' : `Bilderplan ${glob.team.toUpperCase()}-Team`}
			</h1>
			{getHeaderLine(glob.plan, glob.planOriginal)}
			<div>
				<button disabled={!glob.plan.changed || glob.uploading} style={{width:'75px'}} onClick={upload}>{glob.uploading ? '...' : 'upload'}</button>
				&nbsp;&nbsp;
				<button disabled={!glob.plan.changed} onClick={discard}>Änderungen verwerfen</button>
			</div>
		</header>
		<div id="tab" style={{paddingBottom:'100px', overflowY:'scroll', height:'100vh'}}>
			{
				getTab(glob.tab)
			}
		</div>
		<div id="navigation">
			{
				['▤','▦','ⓘ'].map((icon,i) => (
					<div key={i} className={glob.tab==i ? 'selected' : ''} onClick={() => {console.log("setTab", i); dispatch(setTab(i))}}>{icon}</div>
				))
			}
		</div>
		<DialogManager />
	</div>)
}

const getHeaderLine = (plan, planOriginal) => {
	const standDate = planOriginal.saved
	  ? new Date(planOriginal.saved)
	  : null;

	const loadedTime = planOriginal.loaded
	  ? new Date(`1970-01-01T${planOriginal.loaded}`)
	  : null;

	const heute = new Date();
	const istHeute = standDate &&
	  standDate.toDateString() === heute.toDateString();

	const standText = standDate
	  ? `Stand: ${standDate.getDate()}.${standDate.getMonth() + 1}.${standDate.getFullYear()} ${standDate.getHours().toString().padStart(2, '0')}:${standDate.getMinutes().toString().padStart(2, '0')}`
	  : 'Stand: -';

	const geladenText = planOriginal.loaded
	  ? `zul. geprüft: ${
	      istHeute
	        ? `${loadedTime.getHours().toString().padStart(2, '0')}:${loadedTime.getMinutes().toString().padStart(2, '0')}:${loadedTime.getSeconds().toString().padStart(2, '0')}`
	        : planOriginal.loaded.split('T')[0] // falls du loaded später als komplettes Datum speicherst
	    }`
	  : '';

		return (<div style={{ fontSize: '0.9rem', marginTop: '5px' }}>
			<strong>{standText}{plan.changed ? ' (bearbeitet)' : ''}</strong>&nbsp;&nbsp;&nbsp; {geladenText}
		</div>)

}

const getTab = (tab) => {
  switch (tab) {
    case 0: return <TabTable />;
    case 1: return <TabBild />;
    case 2: return <TabInfo />;
    default: return null;
  }
};


