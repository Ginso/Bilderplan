import React, { useState, useEffect, useRef } from 'react';
import * as ReactDOM from 'react-dom/client';
import {Link, useParams, useNavigate} from "react-router-dom";
import {useSelector, useDispatch} from 'react-redux'
import {queryPHP, postPHP, MyInput, MySelect, utils} from '../../utils/utils'
import {getPersistentStorage, storePlan, storePlanOriginal, setPosition, setPart} from '../../utils/redux'
import {getSession, setTeam, setTab, setUploading, setShowDialog, setCurrBildIdx, setEditMode, setUnit, setSelectedPoints, setAnimated} from '../../utils/redux'


export default function TabTable(props) {
	const dispatch = useDispatch();
	const glob = {...useSelector(getPersistentStorage), ...useSelector(getSession)};
	const [showWay, setShowWay] = useState(0)

	const pos = glob.pos;
  const part = glob.part;
  let bilder = glob.plan.bilder ?? []
  bilder = bilder.map((bild, idx) => {
    let bildCopy = { ...bild };
    if(idx == 0) {
      bildCopy.isNew = true;
    } else {
      bildCopy.isNew = false;
      const prevBild = bilder[idx - 1];
      if(glob.pos == -1 || part !== 1) {
        let dist = [bild.leaders[0][0] - prevBild.leaders[0][0], bild.leaders[0][1] - prevBild.leaders[0][1]]
        let diffLeader = false
        for(let i in bild.leaders) {
          if(bild.leaders[i][0] - prevBild.leaders[i][0] != dist[0] || bild.leaders[i][1] - prevBild.leaders[i][1] != dist[1]) {
            diffLeader = true;
            break;
          }
        }
        if(diffLeader) bildCopy.isNew = true;
      }

      if(!bildCopy.isNew && (glob.pos == -1 || part !== 2)) {
        let diffFollower = false
        if(bild.followers || prevBild.followers) {
          let followers = bild.followers ?? bild.leaders
          let prevFollowers = prevBild.followers ?? prevBild.leaders
          let dist = [followers[0][0] - prevFollowers[0][0], followers[0][1] - prevFollowers[0][1]]
          for(let i in followers) {
            if(followers[i][0] - prevFollowers[i][0] != dist[0] || followers[i][1] - prevFollowers[i][1] != dist[1]) {
              diffFollower = true;
              break;
            }
          }
        }
        if(diffFollower) bildCopy.isNew = true;
      }
    }
    if(glob.pos == -1) {
      let xVals = Array.from(new Set(bild.leaders.map(p => p[0]))).toSorted((x,y) => x-y)
      let yVals = Array.from(new Set(bild.leaders.map(p => p[1]))).toSorted((x,y) => x-y)
      let dx = '-'
      if(xVals.length > 1) {
        dx = xVals[1]-xVals[0]
        for(let i = 1; i < xVals.length-1; i++) {
          if(xVals[i+1]-xVals[i] != dx) {
            dx = '-'
            break
          }
        }
      }
      let dy = '-'
      if(yVals.length > 1) {
        dy = yVals[1]-yVals[0]
        for(let i = 1; i < yVals.length-1; i++) {
          if(yVals[i+1]-yVals[i] != dy) {
            dy = '-'
            break
          }
        }
      }
      if(bild.followers) {
        let xVals = Array.from(new Set(bild.followers.map(p => p[0]))).toSorted((x,y) => x-y)
        let yVals = Array.from(new Set(bild.followers.map(p => p[1]))).toSorted((x,y) => x-y)
        let dx2 = '-'
        if(xVals.length > 1) {
          dx2 = xVals[1]-xVals[0]
          for(let i = 1; i < xVals.length-1; i++) {
            if(xVals[i+1]-xVals[i] != dx2) {
              dx2 = '-'
              break
            }
          }
        }
        if(dx != dx2) dx = `${dx} / ${dx2}`
        let dy2 = '-'
        if(yVals.length > 1) {
          dy2 = yVals[1]-yVals[0]
          for(let i = 1; i < yVals.length-1; i++) {
            if(yVals[i+1]-yVals[i] != dy2) {
              dy2 = '-'
              break
            }
          }
        }
        if(dy != dy2) dy = `${dy} / ${dy2}`      
      }
      bildCopy.dx = dx
      bildCopy.dy = dy
    }
    return bildCopy;
  });

  const getCoordinates = (bild) => {
    if (glob.pos === -1) return { x: '', y: '' };
    const points = part === 2 ? bild.leaders : bild.followers ?? bild.leaders;
    const point = points?.[glob.pos] ?? [null, null];
    return { x: point[0], y: point[1] };
  };

	return <div id="tabTable" style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
		<PositionSelector showWay={showWay} setShowWay={setShowWay}/>
		<div>Klicke auf eine Zeile, um das entsprechende Bild zu öffnen:</div>
		<table className="bilder-table" style={{ borderCollapse: 'collapse', textAlign:'left'}}>
			<colgroup>
				<col style={{border: '1px solid black'}}></col>
				<col></col>
				<col style={{borderRight: '1px solid black'}}></col>
				{showWay==1 && glob.pos >= 0 && <col></col> }
				{showWay==1 && glob.pos >= 0 && <col></col> }
				{showWay==1 && glob.pos >= 0 && <col style={{borderRight: '1px solid black'}}></col> }
				<col style={{borderRight: '1px solid black'}}></col>
			</colgroup>
			<tbody>
				<tr style={{position:'sticky', top:'0', zIndex:'2', height:'25px', backgroundColor:'white', borderTop:'1px solid black'}}>
					<th rowSpan={2}>Bild</th>
					<th colSpan="2">Position</th>
					{showWay==1 && glob.pos >= 0 && <th colSpan="3">Strecke</th>}
					<th rowSpan={2}>Punkt ist</th>
				</tr>
				<tr style={{position:'sticky', top:'25px', zIndex:'2', height:'25px', backgroundColor:'white', borderBottom:'1px solid black'}}>
					<th>{glob.pos == -1 ? 'dX' : 'X'}</th>
					<th>{glob.pos == -1 ? 'dY' : 'Y'}</th>
					{glob.pos >= 0 && showWay==1 && <th>X</th>}
					{glob.pos >= 0 && showWay==1 && <th>Y</th>}
					{glob.pos >= 0 && showWay==1 && <th>m</th>}
				</tr>
        {bilder.map((bild,idx) => {
          const { x, y } = getCoordinates(bild);
					const p = getCoordinates(bilder[Math.max(0,idx-1)])
					let dx = Math.abs(x - p.x)
					let dy = Math.abs(y - p.y)
					let d = Math.sqrt(dx*dx+dy*dy)
          return (
            <tr key={bild.id}
							onClick={()=>{dispatch(setCurrBildIdx(idx)); dispatch(setTab(1))}}
							style={{backgroundColor:idx%2==0 ? '#aaa' : '#ddd', 
                border: glob.selected == idx && '3px solid cyan'
              }}>
              <td style={{fontWeight: bild.isNew ? 'bold' : 'normal'}}>{idx+1}: {bild.title}</td>
              <td>{glob.pos == -1 ? bild.dx : x}</td>
              <td>{glob.pos == -1 ? bild.dy : y}</td>
              {glob.pos > -1 && showWay == 1 && (
                <>
                  <td>{dx}</td>
                  <td>{dy}</td>
                  <td>{Math.round(d*10)/10}</td>
                </>
              )}
              <td>{bild.point}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
	</div>
}

const PositionSelector = ({showWay, setShowWay}) => {
  const dispatch = useDispatch();
	const glob = {...useSelector(getPersistentStorage), ...useSelector(getSession)};

	const handlePositionChange = (e) => {
    const value = parseInt(e.target.value, 10);
    dispatch(setPosition(value));
  };

  const handlePartChange = (e) => {
    const value = parseInt(e.target.value, 10);
    dispatch(setPart(value));
  };

	return (
    <div id="positionSelector">
      <div>
				<label>Position:</label>
        <label>
          <input
            type="radio"
            name="position"
            value={-1}
            checked={glob.pos === -1}
            onChange={handlePositionChange}
          />
          -
        </label>

        {Array.from({ length: glob.plan.pairs }, (_, i) => (
          <label key={i}>
            <input
              type="radio"
              name="position"
              value={i}
              checked={glob.pos === i}
              onChange={handlePositionChange}
            />
            {i + 1}
          </label>
        ))}
      </div>

      {glob.pos > -1 && (
        <div>
          <label>
            <input
              type="radio"
              name="part"
              value={2}
              checked={glob.part === 2}
              onChange={handlePartChange}
            />
            Herr
          </label>
          <label>
            <input
              type="radio"
              name="part"
              value={1}
              checked={glob.part === 1}
              onChange={handlePartChange}
            />
            Dame
          </label>
          <label>
            <MyInput type="checkbox" checked={showWay} set={setShowWay}/>
            Strecke anzeigen
          </label>

        </div>
      )}
    </div>
  );
}
