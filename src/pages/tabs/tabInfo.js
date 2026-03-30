import React, { useState, useEffect, useRef } from 'react';
import * as ReactDOM from 'react-dom/client';
import {Link, useParams, useNavigate} from "react-router-dom";
import {useSelector, useDispatch} from 'react-redux'
import {queryPHP, postPHP, MyInput, MySelect, utils} from '../../utils/utils'
import {getPersistentStorage, storePlan, storePlanOriginal, setPosition, setPart} from '../../utils/redux'
import {getSession, setTeam, setTab, setUploading, setShowDialog, setCurrBildIdx, setEditMode, setUnit, setSelectedPoints, setAnimated} from '../../utils/redux'


export default function TabInfo(props) {
	const dispatch = useDispatch();
	const glob = {...useSelector(getPersistentStorage), ...useSelector(getSession)};
        return (<div style={{textAlign:'left', display:'inline-block'}}>
                        <h1>Über diese Seite</h1>
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

                </div>)
}
