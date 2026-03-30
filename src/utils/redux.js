import { createSlice, combineReducers, configureStore } from '@reduxjs/toolkit';
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';

// ------------------------------------------------
// ----------- nicht Persitenter Speicher ---------
// ------------------------------------------------
const sessionInitial = {
	team: '',
	tab: 0,
	uploading: false,
	showDialog: 0,
	currBildIdx: 0,
	editMode: 0,
	unit: 1,
	selectedPoints: [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,],
	animated: false,
	selMode: 0,
	rotated: false,
}

const sessionSlice = createSlice({
	name: 'session',
	initialState: sessionInitial,
	reducers: {
		setTeam: (state, action) => { state.team = action.payload; },
		setTab: (state, action) => { state.tab = action.payload; },
		setUploading: (state, action) => { state.uploading = action.payload; },
		setShowDialog: (state, action) => { state.showDialog = action.payload; },
		setCurrBildIdx: (state, action) => { state.currBildIdx = action.payload; },
		setEditMode: (state, action) => { state.editMode = action.payload; },
		setUnit: (state, action) => { state.unit = action.payload; },
		setSelectedPoints: (state, action) => { state.selectedPoints = action.payload; },
		setAnimated: (state, action) => { state.animated = action.payload; },
		setSelMode: (state, action) => { state.selMode = action.payload; },
		setRotated: (state, action) => { state.rotated = action.payload; },
	},
});

export const getSession = (state) => ({...state.session});
export const {setTeam, setTab, setUploading, setShowDialog, setCurrBildIdx, setEditMode, setUnit, setSelectedPoints, setAnimated, setSelMode, setRotated} = sessionSlice.actions;


// ------------------------------------------------
// ------------- Persistenter Speicher ------------
// ------------------------------------------------

const getInitialPlan = () => ({
	id: -1,
	pairs: 8,
	changed: false,
	bilder: []
})

const getInitialPlanOriginal = () => ({
	id: -1,
	pairs: 8,
	saved: null,
	loaded: "",
	bilder: []
})

const persistentSlice = createSlice({
  name: 'persistent',
  initialState : {plan: {}, planOriginal: {}, pos: -1, part: 1},
  reducers: {
    storePlan: (state, action) => {
			const {team, plan} = action.payload
      state.plan[team] = plan;
    },
    storePlanOriginal: (state, action) => {
			const {team, plan} = action.payload
			state.planOriginal[team] = plan;
    },
    setPosition: (state, action) => {
      state.pos = action.payload;
    },
    setPart: (state, action) => {
      state.part = action.payload;
    },
  }
});

// Selektoren
export const getPersistentStorage = (state) => ({
	plan: state.persistent.plan[state.session.team] ?? getInitialPlan(),
	planOriginal: state.persistent.planOriginal[state.session.team] ?? getInitialPlanOriginal(),
	pos: state.persistent.pos,
	part: state.persistent.part,
})


// Actions exportieren
export const { storePlan, storePlanOriginal, setPosition, setPart } = persistentSlice.actions;



// ------------------------------------------------
// --------------------- export -------------------
// ------------------------------------------------

// Persist-Konfiguration
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['persistent'], // Nur dieser Slice wird gespeichert!
};

const rootReducer = combineReducers({
  persistent: persistentSlice.reducer,
  session: sessionSlice.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer
});

export const persistor = persistStore(store);

export const updatePlan = (plan) => {
	let team = store.getState().session.team
	plan.changed = true
	store.dispatch(storePlan({team, plan}))
	store.dispatch(setSelMode(0))
}

export const updateBild = (bild) => {
	var state = store.getState()
	let team = state.session.team
	let plan = structuredClone(state.persistent.plan[team])
	plan.bilder[state.session.currBildIdx] = bild
	updatePlan(plan)
}

export const setPointSelection = (arr, value) => {
	let state = store.getState()
	let temp =  [...(state.session.selMode == 0 ? sessionInitial.selectedPoints : state.session.selectedPoints)]
	arr.forEach(i => temp[i] = value)
	store.dispatch(setSelectedPoints(temp))
	store.dispatch(setSelMode(1))
}

export const togglePointSelection = (idx) => {
	let state = store.getState()
	let temp =  [...(state.session.selMode == 0 ? sessionInitial.selectedPoints : state.session.selectedPoints)]
	temp[idx] = !temp[idx]
	store.dispatch(setSelectedPoints(temp))
	store.dispatch(setSelMode(1))
}
