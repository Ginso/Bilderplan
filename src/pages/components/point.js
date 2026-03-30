import React, { useState, useEffect, useRef } from 'react';
import * as ReactDOM from 'react-dom/client';
import {Link, useParams, useNavigate} from "react-router-dom";
import {useSelector, useDispatch} from 'react-redux'
import { motion, useCycle } from 'framer-motion';
import {queryPHP, postPHP, MyInput, MySelect, utils} from '../../utils/utils'
import {getPersistentStorage, storePlan, storePlanOriginal, setPosition, setPart} from '../../utils/redux'
import {getSession, setTeam, setTab, setUploading, setShowDialog, setCurrBildIdx, setEditMode, setPointSelection, setAnimated, togglePointSelection, updatePlan, setRotated, setMergeConflicts} from '../../utils/redux'

export default function Point({ pos, part }) {
	const dispatch = useDispatch();
	const glob = {
    ...useSelector(getPersistentStorage),
    ...useSelector(getSession),
  };

  const currIdx = glob.currBildIdx;
  const bilder = glob.plan.bilder;
  const currBild = bilder[currIdx];
  const prevBild = bilder[currIdx > 0 ? currIdx - 1 : currIdx];
	const selected = glob.pos == pos && (glob.part === part || glob.plan.bilder[glob.currBildIdx].followers == undefined);

  const getPoint = (bild) => {
    let points = part === 2 ? bild.leaders : bild.followers ?? bild.leaders;
    let p = [...points[pos]];
		p[0] += 8
		p[1] += 8
		return p
  };

  const startCoord = getPoint(prevBild);
  const endCoord = getPoint(currBild);

  const xStart = startCoord[0] * glob.unit - 10;
  const yStart = startCoord[1] * glob.unit - 10;
  const xEnd = endCoord[0] * glob.unit - 10;
  const yEnd = endCoord[1] * glob.unit - 10;
	const idx = (part === 2 ? pos : pos + 8)

	const style = {
		position: 'absolute',
		width: '20px',
		height: '20px',
		borderRadius: '50%',
		border: `1px ${part === 1 ? 'dashed' : 'solid'} ${selected ? 'red' : 'black'}`,
		backgroundColor: glob.selectedPoints[idx] ? 'cyan' : 'white',
		color: selected ? 'red' : 'black',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		fontSize: '12px',
		fontWeight: 'bold',
		userSelect: 'none',

	}

  if (!glob.animated) {
    return (
      <div
        className="clickable"
        style={{...style,
					left: `${xEnd}px`,
					top: `${yEnd}px`,
				}}
				onClick={() => togglePointSelection(idx)}
      >
        {pos + 1}
      </div>
    );
  }

  return (
    <motion.div
      className="clickable"
      initial={{ left: xStart, top: yStart }}
			animate={{ left: [xStart, xStart, xEnd, xEnd], top: [yStart, yStart, yEnd, yEnd] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'linear', times: [0, 0.2, 0.8, 1] }}
      style={style}
    >
      {pos + 1}
    </motion.div>
  );
}
