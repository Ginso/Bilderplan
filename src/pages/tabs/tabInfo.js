import React, { useState, useEffect, useRef } from 'react';
import * as ReactDOM from 'react-dom/client';
import {Link, useParams, useNavigate} from "react-router-dom";
import {useSelector, useDispatch} from 'react-redux'
import {queryPHP, postPHP, MyInput, MySelect, utils} from '../../utils/utils'
import {getPersistentStorage, storePlan, storePlanOriginal, setPosition, setPart, updatePlan} from '../../utils/redux'
import {getSession, setTeam, setTab, setUploading, setShowDialog, setCurrBildIdx, setEditMode, setUnit, setSelectedPoints, setAnimated} from '../../utils/redux'

function isValid(json) {
        try {
                let bilder = JSON.parse(json);
                if(!Array.isArray(bilder)) return "Haupt-Element ist kein Array"
                if(bilder.length == 0) return "Haupt-Element ist leer"
                if(!Array.isArray(bilder[0].leaders)) return "Erstes Bild enthält keine Punkte-Array für leaders"
                let pairs = bilder[0].leaders.length
                for(let key in bilder) {
                        let i = parseInt(key)
                        let bild = bilder[i]
                        if(typeof(bild.point) != 'string') return `Bild ${i+1} enthält keinen String-Eintrag für point`
                        if(typeof(bild.title) != 'string') return `Bild ${i+1} enthält keinen String-Eintrag für title`
                        if(bild.comment !== undefined && typeof(bild.comment) != 'string') return `Bild ${i+1} enthält einen comment der kein String ist`
                        if(!Array.isArray(bild.leaders)) return `Bild ${i+1} enthält keine Punkte-Array für leaders`
                        if(bild.leaders.length != pairs) return `Leaders-Array von Bild ${i+1} hat nicht die gleiche Länge wie in Bild 1`
                        for(let j=0; j<pairs;j++) {
                                let p = bild.leaders[j]
                                if(!Array.isArray(p) || p.length != 2 || typeof(p[0]) != 'number' || typeof(p[1]) != 'number') 
                                        return `In Bild ${i+1} ist der ${j+1}. Eintrag der leaders kein Array aus 2 Zahlen`
                        }
                        if(bild.followers) {
                                if(!Array.isArray(bild.followers)) return `Bild ${i+1} enthält einen eintrag für followers, der kein Punkt ist`
                                if(bild.followers.length != pairs) return `followers-Array von Bild ${i+1} hat nicht die gleiche Länge wie leaders in Bild 1`
                                for(let j=0; j<pairs;j++) {
                                        let p = bild.followers[j]
                                        if(!Array.isArray(p) || p.length != 2 || typeof(p[0]) != 'number' || typeof(p[1]) != 'number')
                                                return `In Bild ${i+1} ist der ${j+1}. Eintrag der followers kein Array aus 2 Zahlen`
                                }

                        }
                }
                return ''
        } catch (error) {
                // JSON ist ungültig
                return 'ungültiges JSON';
        }
}

export default function TabInfo(props) {
	const dispatch = useDispatch();
	const glob = {...useSelector(getPersistentStorage), ...useSelector(getSession)};
        const [folded, setFolded] = useState(true)
        const [folded2, setFolded2] = useState(false)
        const [pairs, setPairs] = useState(glob.plan.pairs)
        const [newPairs, setNewPairs] = useState(1)
        const [json, setJSON] = useState(JSON.stringify([
                {
                        id: 0, 
                        point: "", 
                        title: "Start", 
                        leaders: [[0,0],[1,0],[2,0],[3,0],[4,0]]
                },{
                        id: 1, 
                        point: "", 
                        title: "Ende", 
                        leaders: [[0,0],[1,0],[2,0],[3,0],[4,0]],
                        followers: [[0,1],[1,1],[2,1],[3,1],[4,1]],
                }
        ]))

        const createNewPlan = () => {
                let bild = {
                        id: 0, 
                        point: "", 
                        title: "Start", 
                        leaders: Array.from(Array(parseInt(pairs)).keys()).map(i => [i,0])
                }
                let plan = {
                        id: -1,
                        changed: true,
                        bilder: [bild],
                        pairs
                }
                updatePlan(plan)
        }
        const addPairs = () => {
                let plan = structuredClone(glob.plan)
                plan.pairs = glob.plan.pairs + newPairs
                plan.bilder.forEach(bild => {
                        for(let i = 0; i < newPairs; i++) {
                                bild.leaders.push([-8,-8])
                                if(bild.followers) bild.followers.push([-8,-8])
                        }
                })
                updatePlan(plan)
        }
        const deletePair = pos => {
                let plan = structuredClone(glob.plan)
                plan.pairs--
                plan.bilder.forEach(bild => {
                        for(let i = 0; i < newPairs; i++) {
                                bild.leaders.splice(pos,1)
                                if(bild.followers) bild.followers.splice(pos,1)
                        }
                })
                updatePlan(plan)
        }
        const importJSON = () => {
                let bilder = JSON.parse(json)
                let plan = {
                        id: -1,
                        changed: true,
                        pair:bilder[0].leaders.length,
                        bilder
                }
                updatePlan(plan)
        }
        let jsonResult = isValid(json)

        
        return (<div style={{textAlign:'left', display:'inline-block', width:'calc(100% - 20px)'}}>
                        <h1 onClick={() => setFolded(!folded)}>{folded ? '+' : '-'} Globale Änderungen</h1>
                        {
                                folded ? null : (<>
                                        Alle nachfolgenden Änderungsmöglichkeiten werden nicht automatisch hochgeladen
                                        <h2>Leeren Bilderplan erstellen</h2>
                                        {glob.plan.bilder.length == 0 ? null : 'Überschreibe den aktuellen Bilderplan mit einem leeren Plan.'}
                                        <span style={{display:'flex', gap:'10px'}}>
                                                Paare:
                                                <MySelect value={pairs} set={setPairs}>
                                                        {
                                                                [5,6,7,8].map(i => <option key={i} value={i}>{i}</option>)
                                                        }
                                                </MySelect>
                                                <button onClick={createNewPlan}>erstellen</button>
                                        </span>
                                        {glob.plan.pairs < 8 && (<>
                                                <h2>Paare hinzufügen</h2>
                                                <MySelect value={newPairs} set={setNewPairs}>
                                                {
                                                        [1,2,3,4,5,6,7].slice(0,8-glob.plan.pairs).map(i => <option key={i} value={i}>{i}</option>)
                                                }
                                                </MySelect>
                                                Paar(e)
                                                <button onClick={addPairs}>hinzufügen</button>
                                        </>)}
                                        <h2>Paare löschen</h2>
                                        Achtung: beim löschen eines Paares verschieben sich die höheren Paarnummern<br/>
                                        {
                                                [1,2,3,4,5,6,7,8].slice(0,glob.plan.pairs).map(i => (
                                                        <button style={{margin:'5px'}} key={i} onClick={() => deletePair(i-1)}>Paar {i} löschen</button>
                                                ))
                                        }
                                        <h2>JSON importieren</h2>
                                        Um einen Bilderplan zu importieren braucht ihn als JSON.<br/>
                                        Wer sich damit nicht auskennt, kann versuchen den Plan irgendwie einer KI wie ChatGPT mit nachfolgender Beschreibung(und am besten dem Beispiel) zu geben.<br/>
                                        Benötigt wird ein JSON-Array, mit einem Eintrag pro Bild. Jedes Bild benötigt die folgenden Attribute:<br/>
                                        title(String): Überschrift des Bildes<br/>
                                        point(String): Beschreibung was den Punkt definiert<br/>
                                        leaders(Array): Punkte der Leader, jeder Punkt als array [x,y]<br/>
                                        bei Bildern mit unterschiedlichen Punkten für leader und follower werden wird noch der eintrag followers(analog zu leaders) benötigt
                                        falls es zu dem Bild noch einen Kommentar wird kann dieser mit 'comment' angegeben werden<br/>
                                        <textarea style={{width:"100%", height:'100px'}} value={json} onChange={e => setJSON(e.target.value)}/>
                                        {
                                                jsonResult.length == 0 ? <button onClick={importJSON}>import</button> : jsonResult
                                        }
                                        <h2>JSON export</h2>
                                        <textarea style={{width:"100%", height:'100px'}} value={JSON.stringify(glob.plan.bilder)} disabled/>
                                </>)
                        }

                        <h1 onClick={() => setFolded2(!folded2)}>{folded2 ? '+' : '-'} Über diese Seite</h1>
                        {
                                folded2 ? null : (<>
                                        <h2>▤ Die Übersichtstabelle</h2>
                                        In der Tabelle auf der ersten Seite sieht man eine Übersicht über alle Bilder.<br/>
                                        Man kann auch eine Position, sowie Herr oder Dame auswählen um zu jedem Bild die Position zu sehen.<br/>
                                        Zusätzlich kann man sich noch zu jedem Bild die Strecke aus dem vorherigen Bild anzeigen lassen(jeweils die Seitenmeter(X), Tiefenmeter(Y) und die Gesamtstrecke)<br/>
                                        Die Tabelle dient außerdem als Inhaltsverzeichnis. Mit klick auf eine Zeile gelangt man direkt zu dem entsprechenden Bild.
                                        <h2>▦ Einzelne Bilder</h2>
                                        Wenn ein einzelnes Bild geöffnet ist, sieht man alle Positionen auf graphisch dargestellt(unten ist "vorne") und in der Tabelle.<br/>
                                        Falls für Herren und Damen eigene Punkte definiert sind, werden Damen mit gestricheltem Rahmen dargestellt.<br/>
                                        Sofern auf der Übersichtseite eine Position ausgewählt wurde, dir der entsprechende Punkt in Orange dargestellt<br/>
                                        Durch Klick auf den button 'animation' kann die Bewegung vom letzten Bild in dieses abgespielt werden.<br/>
                                        Man Punkte hier auch auswählen. Dies dient hauptsächlich der bearbeitung(s.u.), kann aber auch hilfreich sein um schnell Einträge aus der Tabelle den Punkten im Bild oder umgekehrt hervorzuheben<br/>
                                        Auswahlmöglichkeiten:
                                        <ul>
                                                <li>Einzeln durch Klick auf den Punkt oder die Position in der Tabelle</li>
                                                <li>Spaltenweise in der Tabelle(alle Herren/Damen/Paare) durch Klick auf die Spaltenüberschrift</li>
                                                <li>Alle Punkte mit einem bestimmten Seiten- oder Tiefenmeter durch Klick auf den entsprechenden Meter am Rand des Plans</li>
                                        </ul>
                                        <h2>Bearbeiten</h2>
                                        Der Plan kann hier auch bearbeitet werden. Alle Änderungen werden zunächst automatisch auf dem Gerät gespeichert.<br/>
                                        Durch Klick auf den Button 'upload' wird der gesamte Plan so wie gerade ist hochgeladen.<br/>
                                        Bei jedem Seitenaufbau wird der zuletzt hochgeladene Plan heruntergeladen.<br/>
                                        Um den Bearbeitungsmodus zu aktivieren, kann man bei einem geöffneten Bild oben in der Titelleiste auf den Button ✎ klicken.
                                        Bearbeitungsmöglichkeiten (siehe auch Auswahlmöglichkeiten oben):
                                        <ul>
                                                <li>mit den schwarzen Pfeilen können alle ausgewählten Punkte in 0.25, 0.5 oder 1m-Schritten verschoben werden</li>
                                                <li>Wenn exakt 2 Punkte ausgewählt sind erscheint ein button um diese zu vertauschen</li>
                                                <li>Wenn Punkte mit mehr als 2 unterschiedlichen Seitenmetern ausgewählt sind und diese einen gleichmäßigen Abstand haben, erscheint ein Button um diesen zu bearbeiten, also die Punkte auseinander- oder zusammenziehen.</li>
                                                <li>Das gleiche gilt natürlich für die Tiefenmeter</li>
                                                <li>Wenn die Punkte pro Paar angegeben sind, kann man per klick auf den Button 'trennen (Herr/Dame)' die Punkte für Herren und Damen einzeln angeben. Ansonsten gibt es einen button um die Punkte zusammenzuführen(hier muss man noch auswählen ob man die Punkte der Herren oder Damen übernehmen möchte)</li>
                                                <li>natürlich kann man die Meter auch direkt eingeben indem man auf ✎ in der Tabelle klickt</li>
                                                <li>Um ein neues Bild vor oder nach dem angezeigten einzufügen, kann man auf den Button + vor oder nach dem Titel oben klicken. Hierbei wird das aktuelle Bild kopiert. Das neu erstellte Bild wird direkt geöffnet</li>
                                        </ul>
                                </>)
                        }

                </div>)
}
