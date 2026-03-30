import {createStore} from 'redux'
import {createSlice, configureStore} from '@reduxjs/toolkit'
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';

const initial = {
	plan: {
		id: -1,
		pairs: 8,
		saved: null,
		changed: false,
		lastId: 0,
		bilder: []
	},
	planOriginal: {
		id: -1,
		pairs: 8,
		saved: null,
		changed: false,
		lastId: 0,
		loaded:"",
		bilder: []
	},
	settings: {
		pos:-1,
		part:1,
		allowCookies:false
	}
}

const slice = createSlice({
	name: 'storage',
	initialState: {plan:{}, planOriginal:{}, settings:initial.settings},

	reducers: {
		storePlan: (state, action) => {
			let team = action.payload.team ?? ""
			state.plan[team] = action.payload;
		},
		storePlanOriginal: (state, action) => {
			let team = action.payload.team ?? ""
			state.planOriginal[team] = action.payload;
		},
		storeSettings: (state, action) => {
			state.settings = action.payload;
		}
	}
});

export const getStoredPlan = team => state => state.plan[team] ?? initial.plan;
export const getStoredPlanOriginal = team => state => state.planOriginal[team] ?? initial.planOriginal;
export const getStoredSettings = state => state.settings;
export const {storePlan, storePlanOriginal, storeSettings} = slice.actions;

const persistConfig = {
	key: 'root',
	storage
}
const persistedReducer = persistReducer(persistConfig, slice.reducer)

export const store = configureStore({
	reducer: persistedReducer
});

export const persistor = persistStore(store)
