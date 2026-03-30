import React, { useState, useEffect, useRef } from 'react';
import * as ReactDOM from 'react-dom/client';
import {Link, useParams, useNavigate} from "react-router-dom";
import {useSelector, useDispatch} from 'react-redux'
import { motion, useCycle } from 'framer-motion';
import {queryPHP, postPHP, MyInput, MySelect, utils} from '../../utils/utils'
import {getPersistentStorage, storePlan, storePlanOriginal, setPosition, setPart} from '../../utils/redux'
import {getSession, setTeam, setTab, setUploading, setShowDialog, setCurrBildIdx, setEditMode, setPointSelection, setAnimated, togglePointSelection, updateBild, setRotated, setMergeConflicts} from '../../utils/redux'

export default function Wheel() {
	const dispatch = useDispatch();
	const glob = {...useSelector(getPersistentStorage), ...useSelector(getSession)};


	const moveBy = (dx, dy) => {
		let bild = structuredClone(glob.plan.bilder[glob.currBildIdx])
		for(let i = 0; i < bild.leaders.length; i++) {
			if(glob.selectedPoints[i]) {
				bild.leaders[i][0] += dx
				bild.leaders[i][1] += dy
			}
		}
		if(bild.followers) {
			for(let i = 0; i < bild.followers.length; i++) {
				if(glob.selectedPoints[i+8]) {
					bild.followers[i][0] += dx
					bild.followers[i][1] += dy
				}
			}
		}
		updateBild(bild)
	}

	const move = (direction, step) => {
		let d = (glob.rotated) ? (direction+4)%8 : direction
		switch (d) {
			case 0: moveBy(0, -step); return
			case 1: moveBy(step, -step); return
			case 2: moveBy(step, 0); return
			case 3: moveBy(step, step); return
			case 4: moveBy(0, step); return
			case 5: moveBy(-step, step); return
			case 6: moveBy(-step, 0); return
			case 7: moveBy(-step, -step); return
		}
	}

	let arr = Array.from({length:8})
	return (<div style={{width:'273.137px', height:'273.137px', position:'relative', display:'inline-block', verticalAlign:'top'}}>
			{arr.map((x,i) => <div onClick={() => move(i,1)} className="clickable arrow big" style={{transform:`translateX(-50%) rotate(${45*i}deg)`}}>{i == 0 ? '1' : ''}</div>)}
			{arr.map((x,i) => <div onClick={() => move(i,0.5)} className="clickable arrow medium" style={{transform:`translateX(-50%) rotate(${45*i}deg)`}}>{i == 0 ? '0.5' : ''}</div>)}
			{arr.map((x,i) => <div onClick={() => move(i,0.25)} className="clickable arrow small" style={{transform:`translateX(-50%) rotate(${45*i}deg)`}}>{i == 0 ? '0.25' : ''}</div>)}
		</div>)
}
