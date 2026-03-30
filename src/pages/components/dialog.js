// DialogManager.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { store, getSession, setShowDialog } from '../../utils/redux';


let view = null

export function openDialog(text, callback) {
	view = (<div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
		<p>{text}</p>
		<div style={{display:'flex', justifyContent:"space-evenly"}}>
			<button onClick={() => store.dispatch(setShowDialog(false))}>Abbrechen</button>
			<button onClick={() => {
				store.dispatch(setShowDialog(false));
				if (typeof callback === 'function') callback();
			}}>OK</button>
		</div>
	</div>)
	store.dispatch(setShowDialog(true));
}

export function openDialogView(v) {
	view = v
	store.dispatch(setShowDialog(true));
}

export function DialogManager() {
  const { showDialog: isVisible } = useSelector(getSession);

  if (!isVisible) return null;

  return (
    <div id="dialogBg" style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      {view}
    </div>
  );
}
