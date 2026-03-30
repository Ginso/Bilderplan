const urlForQuery =
	(typeof window !== 'undefined' &&
		window.__BILDERPLAN_CONFIG__ &&
		window.__BILDERPLAN_CONFIG__.urlForQuery)

export const checkUrlForQuery = () => {
	if(urlForQuery !== undefined && urlForQuery !== '') {
		return true;
	}
	alert('URL for query is not set');
	return false;
}

export const postPHP = (f, data, callback, errorCB=null) => {
	if(!checkUrlForQuery()) return;
	let formData = new FormData();
	for(let key in data) {
		formData.append(key, data[key])
	}
	let url = urlForQuery + '?f=' + f;
	fetch(url, {
		method: "POST",
		body: formData
	})
		.then(response => response.json())
		.then(json => {

			if(json.success) callback(json.data);
			else {
				if(errorCB == null) console.log(json.data)
				else errorCB(json.data);
			}
		})
		.catch(typeof errorCB === 'function' ? errorCB : () => {})
}

export const queryPHP = (f, d, callback, errorCB=null) => {
	if(!checkUrlForQuery()) return;
	let data = {...d}
	let url = urlForQuery + '?f=' + f;
	for(let key in data) url += "&" + key + "=" + encodeURIComponent(data[key]);
	console.log(url)
	fetch(url)
		.then(response => response.json())
		.then(json => {

			if(json.success) callback(json.data);
			else {
				alert(json.data);
			}
		})
		.catch(err => alert(err))
}

export const MyInput = props => {
	const p = {...props};
	const set = props.set;
	delete p.set;
	if(p.original !== undefined) {
		let classList = (p.className ?? "").split(" ");
		if(p.original != p.value) {
			classList.push("changed");
		}
		p.className = classList.join(" ");
	}
	return <input {...p} onChange={e => set(e.target.type == "checkbox" ? (e.target.checked ? 1 : 0) : e.target.value, props.idx)}/>
}

export const MySelect = props => {
	const p = {...props};
	const set = props.set;
	delete p.set;
	delete p.children;
	if(p.original !== undefined) {
		let classList = (p.className ?? "").split(" ");
		if(p.original != p.value) {
			classList.push("changed");
		}
		p.className = classList.join(" ");
	}
	return (<select {...p} onChange={e => {
		if(props.hook) props.hook(e.target.value, props.idx);
		set(e.target.value, props.idx)}
	}>{props.children}</select>)
}

export const utils = {
	compareRec: (o1, o2) => {
		if (o1 === o2) return true;

	  if (typeof o1 !== typeof o2) return false;
	  if (o1 === null || o2 === null) return false;

	  if (Array.isArray(o1) !== Array.isArray(o2)) return false;

	  if (typeof o1 === 'object') {
	    const keys1 = Object.keys(o1);
	    const keys2 = Object.keys(o2);
	    if (keys1.length !== keys2.length) return false;
	    for (let key of keys1) {
	      if (!utils.compareRec(o1[key], o2[key])) return false;
	    }
	    return true;
	  }

	  return false;
	}

}
