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
  const bilder = glob.plan.bilder ?? [];

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
				{glob.pos >= 0 && <col></col> }
				{glob.pos >= 0 && <col style={{borderRight: '1px solid black'}}></col> }
				{showWay==1 && glob.pos >= 0 && <col></col> }
				{showWay==1 && glob.pos >= 0 && <col></col> }
				{showWay==1 && glob.pos >= 0 && <col style={{borderRight: '1px solid black'}}></col> }
				<col style={{borderRight: '1px solid black'}}></col>
			</colgroup>
			<tbody>
				<tr style={{position:'sticky', top:'0', zIndex:'2', height:'25px', backgroundColor:'white', borderTop:'1px solid black'}}>
					<th rowSpan={glob.pos < 0 ? 1 : 2}>Bild</th>
					{glob.pos >= 0 && <th colSpan="2">Position</th>}
					{showWay==1 && glob.pos >= 0 && <th colSpan="3">Strecke</th>}
					<th rowSpan={glob.pos < 0 ? 1 : 2}>Punkt ist</th>
				</tr>
				{glob.pos >= 0 && <tr style={{position:'sticky', top:'25px', zIndex:'2', height:'25px', backgroundColor:'white', borderBottom:'1px solid black'}}>
					<th>X</th>
					<th>Y</th>
					{showWay==1 && <th>X</th>}
					{showWay==1 && <th>Y</th>}
					{showWay==1 && <th>m</th>}
				</tr>}
        {bilder.map((bild,idx) => {
          const { x, y } = getCoordinates(bild);
					const p = getCoordinates(bilder[Math.max(0,idx-1)])
					let dx = Math.abs(x - p.x)
					let dy = Math.abs(y - p.y)
					let d = Math.sqrt(dx*dx+dy*dy)
          return (
            <tr key={bild.id}
							onClick={()=>{dispatch(setCurrBildIdx(idx)); dispatch(setTab(1))}}
							style={{backgroundColor:idx%2==0 ? '#aaa' : '#ddd', border: glob.selected == idx && '3px solid cyan'}}>
              <td>{idx+1}: {bild.title}</td>
              {glob.pos > -1 && (
                <>
                  <td>{x}</td>
                  <td>{y}</td>
                </>
              )}
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
