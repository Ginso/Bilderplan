import React, { useState, useEffect, useRef } from 'react';
import * as ReactDOM from 'react-dom/client';
import {Link, useParams, useNavigate} from "react-router-dom";
import {useSelector, useDispatch} from 'react-redux'
import { motion, useCycle } from 'framer-motion';
import {queryPHP, postPHP, MyInput, MySelect, utils} from '../../utils/utils'
import {getPersistentStorage, storePlan, storePlanOriginal, setPosition, setPart} from '../../utils/redux'
import {getSession, setTeam, setTab, setUploading, setShowDialog, setCurrBildIdx, setEditMode, setPointSelection, setAnimated, updatePlan, togglePointSelection, setRotated, setMergeConflicts} from '../../utils/redux'
import {openDialogView} from './dialog'

export const BildTable = props => {
	const dispatch = useDispatch();
	const glob = {
    ...useSelector(getPersistentStorage),
    ...useSelector(getSession),
  };

	const currIdx = glob.currBildIdx;
  const bilder = glob.plan.bilder;
  const currBild = bilder[currIdx];
	const prevBild = bilder[currIdx > 0 ? currIdx - 1 : currIdx].leaders;
	const hasFollowers = currBild.followers !== undefined
	const csl = glob.selectedPoints.filter((x,i) => i < 8 && x).length // number of selected leaders
	const csf = glob.selectedPoints.filter((x,i) => i >= 8 && x).length // number of selected followers


	const edit = () => openDialogView(<EditTable/>)

	return (<table style={{ borderCollapse:'collapse', border:'1px solid black', verticalAlign:'top'}}>
		<colgroup>
			<col style={{borderRight: '1px solid black'}}></col>
			<col></col>
			<col style={{borderRight: '1px solid black'}}></col>
			{hasFollowers && <col></col>}
			{hasFollowers && <col style={{borderRight: '1px solid black'}}></col>}
			<col></col>
		</colgroup>
		<tbody>
			<tr>
				<th>{glob.editMode==1 && <button onClick={edit}>✎</button>}</th>
				<th colSpan="2"
					className="clickable"
					style={{backgroundColor: csl == glob.plan.pairs ? 'cyan' : 'white'}}
					onClick={() => setPointSelection(Array.from({ length: 8 }).map((x,i) => i), csl != glob.plan.pairs)}
					>{hasFollowers ? 'Herr' : 'Paar'}</th>
				{hasFollowers && <th colSpan="2"
					className="clickable"
					style={{backgroundColor: csf == glob.plan.pairs ? 'cyan' : 'white'}}
					onClick={() => setPointSelection(Array.from({ length: 8 }).map((x,i) => i+8), csf != glob.plan.pairs)}
					>Dame</th>}
				<th rowSpan="2">Δ m</th>
			</tr>
			<tr>
				<th>Pos</th>
				<th>X</th>
				<th>Y</th>
				{hasFollowers && <th>X</th>}
				{hasFollowers && <th>Y</th>}
			</tr>
			{currBild.leaders.map((p,j) => {
				let selL = glob.selectedPoints[j]
				let styleL = {
					color: (glob.pos == j && (!hasFollowers || glob.part==2)) ? 'red' : 'black',
					backgroundColor: selL ? 'cyan' : 'white'
				}
				let selF = glob.selectedPoints[j+8]
				let styleF = {
					color: (glob.pos == j && (!hasFollowers || glob.part==1)) ? 'red' : 'black',
					backgroundColor: selF ? 'cyan' : 'white'
				}
				let p2 = prevBild[j]
				let dx = p[0]-p2[0]
				let dy = p[1]-p2[1]
				return (<tr key={j}>
					<td>{j+1}</td>
											<td className="clickable" style={styleL} onClick={() => togglePointSelection(j)}>{p[0]}</td>
											<td className="clickable" style={styleL} onClick={() => togglePointSelection(j)}>{p[1]}</td>
					{hasFollowers && <td className="clickable" style={styleF} onClick={() => togglePointSelection(j+8)}>{currBild.followers[j][0]}</td>}
					{hasFollowers && <td className="clickable" style={styleF} onClick={() => togglePointSelection(j+8)}>{currBild.followers[j][1]}</td>}
					<td>{Math.round(Math.sqrt(dx*dx+dy*dy)*10)/10}</td>
				</tr>)})}
		</tbody>
	</table>)

}

export const EditTable = props => {
	const dispatch = useDispatch();
	const glob = {
    ...useSelector(getPersistentStorage),
    ...useSelector(getSession),
  };

	const currIdx = glob.currBildIdx;
  const bilder = glob.plan.bilder;
  const currBild = bilder[currIdx];
	const prevBild = bilder[currIdx > 0 ? currIdx - 1 : currIdx].leaders;
	const hasFollowers = currBild.followers !== undefined

	const set = (part, pos, axis, val) => {
		let plan = structuredClone(glob.plan)
		if(part == 1) {
			plan.bilder[currIdx].followers[pos][axis] = parseFloat(val)
		} else {
			plan.bilder[currIdx].leaders[pos][axis] = parseFloat(val)
		}
		updatePlan(plan)
	}

	return (<div style={{background:'white', padding: '10px', borderRadius:'5px'}}>
		<table id="editTable" style={{ borderCollapse:'collapse', border:'1px solid black', verticalAlign:'top', margin:'10px'}}>
			<colgroup>
				<col style={{borderRight: '1px solid black'}}></col>
				<col></col>
				<col style={{borderRight: '1px solid black'}}></col>
				{hasFollowers && <col></col>}
				{hasFollowers && <col style={{borderRight: '1px solid black'}}></col>}
				<col></col>
			</colgroup>
			<tbody>
				<tr>
					<th></th>
					<th colSpan="2">{hasFollowers ? 'Herr' : 'Paar'}</th>
					{hasFollowers && <th colSpan="2">Dame</th>}
					<th rowSpan="2">Δ m</th>
				</tr>
				<tr>
					<th>Pos</th>
					<th>X</th>
					<th>Y</th>
					{hasFollowers && <th>X</th>}
					{hasFollowers && <th>Y</th>}
				</tr>
				{currBild.leaders.map((p,j) => {
					let p2 = prevBild[j]
					let dx = p[0]-p2[0]
					let dy = p[1]-p2[1]
					return (<tr key={j}>
						<td>{j+1}</td>
						<td><input onChange={e => set(2, j, 0, e.target.value)} value={p[0]}/></td>
						<td><input onChange={e => set(2, j, 1, e.target.value)} value={p[1]}/></td>
						{hasFollowers && 	<td><input onChange={e => set(1, j, 0, e.target.value)} value={currBild.followers[j][0]}/></td>}
						{hasFollowers && 	<td><input onChange={e => set(1, j, 1, e.target.value)} value={currBild.followers[j][1]}/></td>}
						<td>{Math.round(Math.sqrt(dx*dx+dy*dy)*10)/10}</td>
					</tr>)})}
			</tbody>
		</table>
		<button onClick={() => dispatch(setShowDialog(false))}>ok</button>
	</div>)

}
