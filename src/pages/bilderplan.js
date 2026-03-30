import React, { useState, useEffect, useRef } from 'react';
import * as ReactDOM from 'react-dom/client';
import {Link, useParams, useNavigate} from "react-router-dom";
import {useSelector, useDispatch} from 'react-redux'

import {queryPHP, postPHP, MyInput, MySelect, utils} from '../utils/utils'
import {getSession, setTeam, setTab, setUploading, setShowDialog, setCurrBildIdx, setEditMode, setUnit, setSelectedPoints, setAnimated, setSelMode, setRotated, setMergeConflicts} from '../utils/redux'
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
		if(glob.mergeConflicts?.length > 0) return;
		queryPHP("formationBilder", {team:glob.team}, data => {
			let loaded = new Date().toLocaleTimeString()
			dispatch(storePlanOriginal({team:glob.team, plan:{...data, loaded}}))
			dispatch(storePlan({team:glob.team, plan:{...data, loaded}}))
		});
	}, [glob.team])

	if (glob.team !== param) return <div></div>; // beim ersten aufruf ist das team noch nicht gesetzt

	const upload = () => {
		let copy = structuredClone(glob.plan)
		for(let i = 0; i < copy.bilder.length-1; i++) {
			let bild = copy.bilder[i]
			if(bild.comment) bild.comment = bild.comment.trim()
			if(bild.id == copy.bilder[i+1].id) bild.id = ++copy.lastId
		}
		let json = JSON.stringify(copy.bilder).replaceAll("\\n", "\\\\n")
		dispatch(setUploading(true))
		postPHP("uploadFormationBilder",{lastId:copy.lastId, json, pairs:copy.pairs, team:glob.team}, res=>{
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
				lastId: glob.planOriginal.lastId,
				bilder: glob.planOriginal.bilder
			}}))
			dispatch(setSelMode(0))
		});
	}

	const resolve = (idx) => {
		let messages = [...glob.mergeConflicts]
		messages.splice(idx,1)
		if(messages.length == 0) {
			let clone = structuredClone(glob.plan)
			let changed = false
			for(let i = 0; i < clone.bilder.length-1; i++) {
				if(clone.bilder[i].id == clone.bilder[i+1].id) {
					clone.lastId++
					clone.bilder[i+1].id = clone.lastId
					changed = true
				}
			}
			if(changed) dispatch(storePlan({team:glob.team, plan:clone}))
		}
		dispatch(setMergeConflicts(messages))
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
		{glob.mergeConflicts?.length > 0 && (<div style={{display:'flex', flexDirection:'column', gap:'5px', border:'2px solid red'}}>
			<div>Beim zusammenführen der neuen online Version und deinen lokalen Änderungen gab es Konflikte, die du dir anschauen solltest:</div>
			{glob.mergeConflicts.map((msg, idx) => (<div key={idx}>
					{msg} <button onClick={() => resolve(idx)}>erledigt</button>
				</div>))}
		</div>)}
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


const merge = (planO, planL, planN) => {
	let planMerged = structuredClone(planN)
	// Änderungen von planL in planN einfügen

	// neue lokale Bilder
	let conflicts = []
	if(planL.lastId > planO.lastId) {

		for(let i = 0; i < planL.bilder.length; i++) {
			if(planL.bilder[i].id <= planO.lastId) continue
			if(i == 0) { //neues bild am anfang
				let ids = []
				// füge alle neuen Bilder am Anfang ein
				for(; i < planL.bilder.length; i++) {
					if(planL.bilder[i].id <= planO.lastId) break
					let nid = ++planMerged.lastId
					planL.bilder[i].id = nid
					let bild = structuredClone(planL.bilder[i])
					ids.push(nid)
					planMerged.bilder.splice(i,0,bild)
				}
				//prüfe ob auch planN neue Bilder am Anfang hat
				if(planN.bilder[0].id > planO.lastId) {
					for(let j = 0; j < planN.bilder.length; j++) {
						if(planN.bilder[j].id <= planO.lastId) break
						ids.push(planN.bilder[j].id)
					}
					conflicts.push(['Konflikt mit neuen Bildern. Überprüfe Bilder ', ids])
				}

			} else {
				// suche letztes Bild vor dem neuen, das in merged vorhanden ist
				let n = i-1
				let idx = 0
				while(n > -1) {
					if(planL.bilder[n].id > planO.lastId) {n--; continue;}
					idx = planMerged.bilder.findIndex(b => b.id == planL.bilder[n].id)
					if(idx >= 0) break
					n--;
				}
				let ids = []
				if(n < 0) { // es gibt keins, d.h. bild wurde gelöscht
					//füge neue bilder am anfang ein
					for(; i < planL.bilder.length; i++) {
						if(planL.bilder[i].id <= planO.lastId) break
						let bild = structuredClone(planL.bilder[i])
						let nid = ++planMerged.lastId
						bild.id = nid
						ids.push(nid)
						planMerged.bilder.splice(i,0,bild)
					}
					conflicts.push(['Konflikt mit neuen Bildern. Überprüfe Bilder ', ids])
				} else {
					idx++
					for(; i < planL.bilder.length; i++) {
						if(planL.bilder[i].id <= planO.lastId) break
						let bild = structuredClone(planL.bilder[i])
						let nid = ++planMerged.lastId
						bild.id = nid
						ids.push(nid)
						planMerged.bilder.splice(idx++,0,bild)
					}
					if(planMerged.bilder[idx] && planMerged.bilder[idx].id > planO.lastId) {
						for(let j = idx; j < planMerged.bilder.length; j++) {
							if(planMerged.bilder[j].id <= planO.lastId) break
							ids.push(planN.bilder[j].id)
						}
						conflicts.push(['Konflikt mit neuen Bildern. Überprüfe Bilder ', ids])
					}

				}
			}
		}
	}

	// gelöschte Bilder
	for(let i = 0; i < planO.bilder.length; i++) {
		let idx = planL.bilder.findIndex(b => b.id == planL.bilder[i].id)
		if(idx >= 0) continue
		idx = planMerged.bilder.findIndex(b => b.id == planL.bilder[i].id)
		if(idx < 0) continue
		planMerged.bilder.splice(idx, 1)
	}

	// Änderungen
	for(let i = 0; i < planL.bilder.length; i++) {
		let bildL = planL.bilder[i]
		if(bildL.id > planO.lastId) continue
		let idx = planMerged.bilder.findIndex(b => b.id == planL.bilder[i].id)
		if(idx < 0) continue // bild wurde eh gelöscht

		let bildO = planO.bilder.find(b => b.id == bildL.id)

		// Punkte
		let changedL = !(utils.compareRec(bildL.leaders, bildO.leaders) && utils.compareRec(bildL.followers ?? [], bildO.followers ?? []))
		if(changedL) {
			let changedN = !(utils.compareRec(planMerged.bilder[idx].leaders, bildO.leaders) && utils.compareRec(planMerged.bilder[idx].followers ?? [], bildO.followers ?? []))
			if(changedN) {
				planMerged.bilder.splice(idx, 0, structuredClone(bildL))
				conflicts.push(`Unterschiedliche Änderungen an Punkten im selben Bild. Duplikat wurde erstellt. Eins davon muss gelöscht werden: Bild `, [bildL.id])
				continue
			} else {
				planMerged.bilder[idx].leaders = bildL.leaders
				planMerged.bilder[idx].followers = bildL.followers
			}
		}

		// titel
		if(bildL.title != bildO.title) {
			planMerged.bilder[idx].title = bildL.title
		}
		// Punkt
		if(bildL.point != bildO.point) {
			planMerged.bilder[idx].point = bildL.point
		}
		// comment
		if(bildL.comment != bildO.comment) {
			planMerged.bilder[idx].comment += "\n\n" + bildL.comment
		}

	}

	let messages = conflicts.map(row => {
		let ids = []
		row[1].forEach(id => planMerged.bilder.forEach((b,idx) => {
			if(b.id == id ) ids.push(idx+1)
		}))
		return row[0] + ids.join(',')
	})
	return {planMerged, messages}
}


/* old
const merge = (planO, planL, planN) => {
	let planMerged = structuredClone(planL)
	let offO = 0
	let offN = 0
	let offM = 0
	let messages = []
	for(let i = 0; i < planL.bilder.length; i++) {
		let bildL = planL.bilder[i]
		let bildO = planO.bilder[i+offO]
		let bildN = planN.bilder[i+offN]
		if(bildL.id != bildO?.id) {
			// 2 Möglichkeiten: neues Bild oder Bild gelöscht
			if(bildL.id > planO.lastId) { // neues Bild
				offO--
				if(bildN && bildN.id > planO.lastId) { // neuer Plan hat ebenfalls ein neues Bild hier
					if(utils.compareRec(bildN.leaders, bildL.leaders) && utils.compareRec(bildN.followers ?? [], bildL.followers ?? [])) {
						// gleiches Bild eingefügt, kommentare, etc. mergen
						// titel kann einfach von lokal übernommen werden
						if(bildN.point != bildL.point) {
							bildL.point = `${bildL.point}(lokal) oder ${bildN.point}(online)`
							messages.push(`Bild ${i+offM+1}: 'Punkt ist'`)
						}
						if(bildN.comment != bildL.comment) {
							bildL.comment = `${bildL.comment}(lokal)\n\n ${bildN.comment}(online)`
							messages.push(`Bild ${i+offM+1}: 'Anmerkung'`)
						}
						planMerged.bilder[i+offM] = bildL
					} else {
						offM++
						planMerged.bilder.splice(i+offM, 0, bildN)
						messages.push(`Bild ${i+offM}(lokal) und ${i+offM+1}(online): neue unterschiedliche Bilder an der gleichen Stelle`)
					}
				} // else: nichts tun, neues Bild wurde lokal eingefügt
			} else { // bildO wurde gelöscht
				while(planO.bilder[i+offO].id != bildL.id) offO++

				if(bildN?.id != bildO.id) { // online wurden hier mehr oder weniger bilder gelöscht, übernehme alle löschungen
					let j = planN.bilder.findIndex(b => b.id == bildL.id)
					if(j >= 0) { // online wurden weniger gelöscht, nichts zu tun außer offset anzupassen
						offN = j-i
					} else { // online wurden mehr gelöscht.
						// es genügt, dieses Bild zu löschen, das nächste wird falls notwendig im nächsten Schritt gelöscht
						planMerged.bilder.splice(i+offM, 1)
						offM--
					}
				}
				continue
			}
		}
		if(bildN?.id != bildO.id) {
			// 2 Möglichkeiten: neues Bild oder Bild gelöscht
			if(bildN && bildN.id > planO.lastId) { // neues Bild
				// wir wissen bereits, dass bildL.id == bildO.id. Es gibt also nur online ein neues Bild
				let count = 1
				while(planN.bilder[i+offN+count] && planO.bilder.findIndex(b => b.id == planN.bilder[i+offN+count].id) < 0) count++
				planMerged.bilder.splice(i+offM, 0, ...(planN.bilder.slice(i+offN, i+offN+count)))
				offM += count
				offN += count
			} else { // bildL bzw bildO wurde online gelöscht
				planMerged.bilder.splice(i+offM, 1)
				offM--
				// weitere löschungen würden im nächsten Schritt auftauchen
			}
			continue
		}

		// ab hier ist bildN.id == bildO.id == bildL.id

		// Punkte
		let changedL = !(utils.compareRec(bildL.leaders, bildO.leaders) && utils.compareRec(bildL.followers ?? [], bildO.followers ?? []))
		let changedN = !(utils.compareRec(bildN.leaders, bildO.leaders) && utils.compareRec(bildN.followers ?? [], bildO.followers ?? []))
		if(changedN) {
			if(changedL) {
				offM++
				planMerged.bilder.splice(i+offM, 0, bildN)
				messages.push(`Bild ${i+offM}(lokal) und ${i+offM+1}(online): unterschiedliche Änderungen an Punkten. Eins davon muss gelöscht werden`)
				continue
			} else {
				bildL.leaders = bildN.leaders
				bildL.followers = bildN.followers
			}
		}

		// title
		changedL = bildL.title != bildO.title
		changedN = bildN.title != bildO.title
		// lokale änderungen im titel sollen alles überschreiben
		if(changedN && !changedL) bildL.title = bildN.title

		// point
		changedL = bildL.point != bildO.point
		changedN = bildN.point != bildO.point
		if(changedN) {
			if(changedL) {
				bildL.point = `${bildL.point}(lokal) oder ${bildN.point}(online)`
				messages.push(`Bild ${i+offM+1}: 'Punkt ist'`)
			} else {
				bildL.point = bildN.point
			}
		}

		// comment
		changedL = bildL.comment != bildO.comment
		changedN = bildN.comment != bildO.comment
		if(changedN) {
			if(changedL) {
				bildL.comment = `${bildL.comment}(lokal)\n\n ${bildN.comment}(online)`
				messages.push(`Bild ${i+offM+1}: 'Anmerkung'`)
			} else {
				bildL.comment = bildN.comment
			}
		}
		planMerged.bilder[i+offM] = bildL
	}
	return {planMerged, messages}
}
*/
