import React, { useState, useEffect, useRef } from 'react';
import * as ReactDOM from 'react-dom/client';
import {Link, useParams, useNavigate} from "react-router-dom";
import {useSelector, useDispatch} from 'react-redux'
import { motion, useCycle } from 'framer-motion';
import {queryPHP, postPHP, MyInput, MySelect, utils} from '../../utils/utils'
import {getPersistentStorage, storePlan, storePlanOriginal, setPosition, setPart} from '../../utils/redux'
import {getSession, setTeam, setTab, setUploading, setShowDialog, setCurrBildIdx, setEditMode, setPointSelection, setAnimated, updateBild, togglePointSelection, setRotated, setMergeConflicts} from '../../utils/redux'

export default function DistDlg(props) {
	const dispatch = useDispatch();
	const glob = {...useSelector(getPersistentStorage), ...useSelector(getSession)};
	const currBild = glob.plan.bilder[glob.currBildIdx];

	const selectedPoints = [...currBild.leaders.filter((x,i) => glob.selectedPoints[i]), ...(currBild.followers ?? []).filter((x,i) => glob.selectedPoints[i+8])]
	const selectedVals = Array.from(new Set(selectedPoints.map(p => p[props.axis]))).toSorted((x,y) => x-y)
	const dist = selectedVals[1] - selectedVals[0]
	const half = (selectedVals[0] + selectedVals[selectedVals.length-1]) / 2
	const [fix, setFix] = useState(half)

	const incDist = step => {
		let dist2 = dist+step
		let m = dist2/dist
		let c = (1-m)*fix
		let bild = structuredClone(currBild)
		for(let i = 0; i < bild.leaders.length; i++) {
			if(glob.selectedPoints[i]) {
				bild.leaders[i][props.axis] = Math.round((m * bild.leaders[i][props.axis] + c)*100)/100
			}
		}
		if(bild.followers) {
			for(let i = 0; i < bild.followers.length; i++) {
				if(glob.selectedPoints[i+8]) {
					bild.followers[i][props.axis] = Math.round((m * bild.followers[i][props.axis] + c)*100)/100
				}
			}
		}
		updateBild(bild)
	}

	return (<div id="distDlg" style={{background:'white', padding: '10px', borderRadius:'5px', display:'flex', flexDirection:'column', alignItems: 'center', gap:'10px'}}>
		<b>{props.axis == 0 ? 'Seitenabstände' : 'Tiefenabstände'}</b>
		<div style={{display:'flex', gap:'10px'}}>
				<button onClick={e => {e.preventDefault(); incDist(-0.25)}}>-0.25</button>
				<button onClick={e => {e.preventDefault(); incDist(-0.5)}}>-0.5</button>
				<button onClick={e => {e.preventDefault(); incDist(-1)}}>-1</button>
				<b>{dist}</b>
				<button onClick={e => {e.preventDefault(); incDist(1)}}>+1</button>
				<button onClick={e => {e.preventDefault(); incDist(0.5)}}>+0.5</button>
				<button onClick={e => {e.preventDefault(); incDist(0.25)}}>+0.25</button>
		</div>
		<div>fixiere <MyInput value={fix} set={setFix}/></div>
		<button onClick={() => dispatch(setShowDialog(false))}>ok</button>
	</div>)

}
