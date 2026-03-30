import React, { useState, useEffect, useRef } from 'react';
import * as ReactDOM from 'react-dom/client';
import {Link, useParams, useNavigate} from "react-router-dom";
import {useSelector, useDispatch} from 'react-redux'
import { motion, useCycle } from 'framer-motion';
import {queryPHP, postPHP, MyInput, MySelect, utils} from '../../utils/utils'
import {getPersistentStorage, storePlan, storePlanOriginal, setPosition, setPart} from '../../utils/redux'
import {getSession, setTeam, setTab, setUploading, setShowDialog, setCurrBildIdx, setEditMode, setPointSelection, setAnimated, updatePlan, updateBild, setRotated} from '../../utils/redux'
import Point from '../components/point'
import Wheel from '../components/wheel'
import DistDlg from '../components/distDlg'
import {BildTable} from '../components/table'
import { DialogManager, openDialog, openDialogView } from '../components/dialog';


export default function TabBild(props) {
	const dispatch = useDispatch();
	const glob = {...useSelector(getPersistentStorage), ...useSelector(getSession)};
	const currBildIdx = glob.currBildIdx
	const currBild = glob.plan.bilder[currBildIdx];
	const [inp, setInp] = useState('')
	if(!currBild) return null

	const xVals = Array.from(new Set(currBild.leaders.map(p => p[0])))
	const yVals = Array.from(new Set(currBild.leaders.map(p => p[1])))

	let originalBild = glob.planOriginal.bilder[currBildIdx]
	if(originalBild.id != currBild.id)
		originalBild = glob.planOriginal.bilder.find(b => b.id==currBild.id)
	const changed = originalBild && !utils.compareRec(currBild, originalBild)


	let xVals2 = []
	let yVals2 = []
	if(currBild.followers) {
		let sameX = true
		let sameY = true
		currBild.leaders.forEach((p, i) => {
			if(currBild.followers[i][0] != p[0]) sameX = false
			if(currBild.followers[i][1] != p[1]) sameY = false
		})
		if(!sameX) {
			xVals2 = Array.from(new Set(currBild.followers.map(p => p[0])))
		}
		if(!sameY) {
			yVals2 = Array.from(new Set(currBild.followers.map(p => p[1])))
		}
	}

	const select = (val, axis, part) => {
		let selected = [...glob.selectedPoints]
		let vals = []
		let deselect = true
		let points = part == 2 ? currBild.leaders : currBild.followers
		points.forEach((p, i) => {
			if(p[axis] == val) {
				let idx = part == 2 ? i : i+8
				vals.push(idx)
				if(!selected[idx]) deselect = false
			}
		})
		setPointSelection(vals, !deselect)

	}

	const selectedPoints = [...currBild.leaders.filter((x,i) => glob.selectedPoints[i]), ...(currBild.followers ?? []).filter((x,i) => glob.selectedPoints[i+8])]
	const selectedXVals = Array.from(new Set(selectedPoints.map(p => p[0]))).toSorted((x,y) => x-y)
	const selectedYVals = Array.from(new Set(selectedPoints.map(p => p[1]))).toSorted((x,y) => x-y)

	const sameX = selectedXVals.length > 2 && new Set(selectedXVals.map((x,i)=> i == 0 ? 0 : x-selectedXVals[i-1]).slice(1)).size == 1
	const sameY = selectedYVals.length > 2 && new Set(selectedYVals.map((x,i)=> i == 0 ? 0 : x-selectedYVals[i-1]).slice(1)).size == 1

	const selectedPos = []
	for(let i = 0; i < 8; i++) if(glob.selectedPoints[i] || (currBild.followers && glob.selectedPoints[i+8])) selectedPos.push(i)



	console.log({selectedXVals,selectedYVals})
	const swapPoints = () => {
		let positions = Object.keys(glob.selectedPoints).filter(x => glob.selectedPoints[x])
		let bild = structuredClone(currBild)
		let arr1 = positions[0] < 8 ? bild.leaders : bild.followers
		let arr2 = positions[1] < 8 ? bild.leaders : bild.followers
		let [p1, p2] = [arr1[positions[0]%8], arr2[positions[1]%8]]
		arr1[positions[0]%8] = p2
		arr2[positions[1]%8] = p1
		updateBild(bild)
	}


	const swapPointsFromHere = () => {
		let plan = structuredClone(glob.plan)
		for(let i = currBildIdx; i < plan.bilder.length; i++) {
			let bild = plan.bilder[i]
			let temp = bild.leaders[selectedPos[0]]
			bild.leaders[selectedPos[0]] = bild.leaders[selectedPos[1]]
			bild.leaders[selectedPos[1]] = temp
			if(bild.followers) {
				temp = bild.followers[selectedPos[0]]
				bild.followers[selectedPos[0]] = bild.followers[selectedPos[1]]
				bild.followers[selectedPos[1]] = temp
			}
			plan.bilder[i] = bild
		}
		updatePlan(plan)
	}

	const deleteBild = () => {
		let plan = structuredClone(glob.plan)
		plan.bilder.splice(currBildIdx,1)
		updatePlan(plan)
		if(currBildIdx >= plan.bilder.length)
		dispatch(setCurrBildIdx(plan.bilder.length-1))
	}

	const copyFrom = () => {
		let bild = glob.plan.bilder[inp-1]
		if(!bild) alert('Ungültige Eingabe')
		updateBild({...currBild, leaders:bild.leaders, followers:bild.followers})
	}

	const toggleFollowers = () => {
		updateBild({...currBild, followers:currBild.followers ? undefined : structuredClone(currBild.leaders)})
	}

	let freeCorners = [true, true, true, true]
	let points = [...currBild.leaders, ...(currBild.followers ?? [])]
	points.forEach(p => {
		if(p[0] < -6 && p[1] < -6) freeCorners[0] = false
		if(p[0] > 6 && p[1] < -6) freeCorners[1] = false
		if(p[0] > 6 && p[1] > 6) freeCorners[2] = false
		if(p[0] < -6 && p[1] > 6) freeCorners[3] = false
	})
	if(glob.rotated) freeCorners = [freeCorners[2], freeCorners[3], freeCorners[0], freeCorners[1]]
	let btnStyle = {right: '0px', top:'0px'}
	if(freeCorners[1]) {}
	else if(freeCorners[0]) btnStyle = {left: '0px', top:'0px'}
	else if(freeCorners[2]) btnStyle = {right: '0px', bottom:'0px'}
	else if(freeCorners[3]) btnStyle = {left: '0px', bottom:'0px'}


	return (<div id="tabBild" style={{padding:'0px 20px'}}>
			<BildHeader/> {/* Zeile mit Title, Navigation zu anderen Bildern, editMode, etc.*/}
			<div style={{textAlign:'center'}}>
				{glob.editMode && <div><button style={{color:'red'}} onClick={deleteBild}>Bild löschen</button></div>}
				{glob.editMode && <div><button disabled={!changed} onClick={() => updateBild(originalBild)}>Änderungen in diesem Bild verwerfen</button></div>}
				<div id="gridWrapper" className={glob.rotated ? "rotated" : ""} style={{display:'inline-block', marginTop:'50px', position:'relative'}}>
					<Grid/>
					<div id="posTop" style={{top:'-20px'}}>
						{xVals.map(v => <div onClick={() => select(v,0,2)} className="markerTop clickable" style={{left:(v+8)*glob.unit + 'px'}}>{v}</div>)}
						{xVals2.length > 0 && <div className="markerTop" style={glob.rotated ? {right:'0px'} : {left:'5px'}}>H</div>}
					</div>
					{xVals2.length > 0 && <div id="posTop" style={{top:'-40px'}}>
						{xVals2.map(v => <div onClick={() => select(v,0,1)} className="markerTop followers clickable" style={{left:(v+8)*glob.unit + 'px'}}>{v}</div>)}
						<div className="markerTop" style={glob.rotated ? {right:'0px'} : {left:'5px'}}>D</div>
					</div>}
					<div id="posLeft" style={{left:'-50px'}}>
						{yVals.map(v => <div onClick={() => select(v,1,2)} className="markerLeft clickable" style={{top:(v+8)*glob.unit + 'px'}}>{v}</div>)}
						{yVals2.length > 0 && <div className="markerLeft" style={glob.rotated ? {bottom:'0px'} : {top:'5px'}}>H</div>}
					</div>
					{yVals2.length > 0 && <div id="posLeft" style={{left:'-75px'}}>
						{yVals2.map(v => <div onClick={() => select(v,1,1)} className="markerLeft clickable" style={{top:(v+8)*glob.unit + 'px'}}>{v}</div>)}
						<div className="markerLeft" style={glob.rotated ? {bottom:'0px'} : {top:'5px'}}>D</div>
					</div>}
					<div id="pointWrapper">
						{currBild.leaders.map((p, idx) => <Point key={idx} pos={idx} part={2}/>)}
						{currBild.followers && currBild.followers.map((p, idx) => <Point key={idx} pos={idx} part={1}/>)}
					</div>
					<button style={btnStyle} onClick={() => dispatch(setRotated(!glob.rotated))}>⥁</button>
				</div>
				<div style={{display:'inline-block', marginTop:'50px', verticalAlign:'top'}}>
					<div style={{display:'inline-flex', flexDirection:'column', alignItems: 'center', verticalAlign:'top', marginLeft:'50px'}}>
						{glob.editMode == 1 && <Wheel/>}
						<div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'10px'}}>
							<button style={{marginTop:'10px', width:'75px'}} onClick={()=>dispatch(setAnimated(!glob.animated))}>{glob.animated ? 'stop' : 'animation'}</button>
							{glob.editMode == 1 && (<>
								<div><button onClick={copyFrom}>übernehme Punkte aus Bild</button><MyInput style={{width:'30px', marginLeft:'5px'}} value={inp} set={setInp}/></div>
								{sameX && <button onClick={()=>openDialogView(<DistDlg axis={0}/>)}>Seitenabstände...</button>}
								{sameY && <button onClick={()=>openDialogView(<DistDlg axis={1}/>)}>Tiefenabstände...</button>}
							</>)}
							{selectedPos.length == 2 && <button onClick={swapPoints}>tauschen</button>}
							{selectedPos.length == 2 && <button onClick={swapPointsFromHere}>tauschen ab hier</button>}
						</div>
					</div>
					<div style={{display:'inline-flex', flexDirection:'column', alignItems: 'center', verticalAlign:'top', marginLeft:'50px', gap:'10px'}}>
						{glob.editMode == 0 && <div>{currBild.point}</div>}
						<BildTable/>
						{glob.editMode == 1 && <button onClick={toggleFollowers}>{currBild.followers ? 'Damenpunkte löschen' : 'Damenpunkte hinzufügen'}</button>}

						{glob.editMode == 0 && <div>{currBild.comment}</div>}
						{glob.editMode == 1 && (<div>
							Punkt ist <MyInput type="text" value={currBild.point} set={val => updateBild({...currBild, point:val})}/><br/><br/>
							<textarea style={{width:"250px", height:'100px'}} value={currBild.comment ?? ''} onChange={e => updateBild({...currBild, comment:e.target.value})}/>
						</div>)}
					</div>
				</div>

			</div>

	</div>)
}

const BildHeader = props => {
	const dispatch = useDispatch();
	const glob = {...useSelector(getPersistentStorage), ...useSelector(getSession)};
	const currBildIdx = glob.currBildIdx
	const currBild = glob.plan.bilder[currBildIdx];

	const handleCopyBild = (before) => {
		let newId = parseInt(glob.plan.maxId) + 1
    	const newBild = { ...currBild, id: newId };
		newBild.title += " - Kopie"
		const updatedBilder = [...glob.plan.bilder];

		if (before) {
			updatedBilder.splice(currBildIdx, 0, newBild);
				// currBildIdx bleibt gleich
		} else {
			updatedBilder.splice(currBildIdx + 1, 0, newBild);
			dispatch(setCurrBildIdx(currBildIdx + 1));
		}

		updatePlan({
			...glob.plan,
			bilder: updatedBilder,
			changed: true,
			maxId: newId
		});
	};

	return (<div id="bildHeader" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px', gap: '5px' }}>
		<div style={{flex:1}}>
			{currBildIdx > 0 && (
				<div className="arrLeft clickable" onClick={() => dispatch(setCurrBildIdx(currBildIdx - 1))}>
					Bild {currBildIdx} {glob.plan.bilder[currBildIdx - 1].title}
				</div>
			)}
		</div>

		{glob.editMode==1 && <button onClick={() => handleCopyBild(true)} style={{ marginRight: '10px' }}>+</button>}

		<div style={{flex:1}}>
			Bild {currBildIdx + 1} {glob.editMode ?
				<MyInput
					type="text"
					value={currBild.title}
					set={val => updateBild({...currBild, title: val})}
					style={{width:"calc(100% - 150px)"}}/>
				: currBild.title}

			<button onClick={() => dispatch(setEditMode(!glob.editMode))} style={{ marginLeft: '10px' }}>
				{glob.editMode ? '✕' : '✎'}
			</button>
		</div>

		{glob.editMode==1 && <button onClick={() => handleCopyBild(false)} style={{ marginRight: '10px' }}>+</button>}

		<div style={{flex:1}}>
			{currBildIdx < glob.plan.bilder.length - 1 && (
				<div className="arrRight clickable" onClick={() => dispatch(setCurrBildIdx(currBildIdx + 1))}>
					Bild {currBildIdx + 2} {glob.plan.bilder[currBildIdx + 1].title}
				</div>
			)}
		</div>
	</div>)
}

const Grid = props => {
	const glob = {
		...useSelector(getPersistentStorage),
		...useSelector(getSession),
	};

	const unit = glob.unit; // z. B. 50 → 50px pro Meter
	const fieldSize = 2 * unit; // 2 Meter pro Feld

	return (<table id="grid">
	<tbody>
	{Array.from({ length: 8 }, (_, rowIdx) => (
		<tr key={rowIdx}>
		{Array.from({ length: 8 }, (_, colIdx) => (
			<td
			key={colIdx}
			style={{
				width: `${fieldSize}px`,
				height: `${fieldSize}px`,
			}}
			></td>
		))}
		</tr>
	))}
	</tbody>
	</table>)
}
