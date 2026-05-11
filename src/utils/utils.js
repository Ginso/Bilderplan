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

const demoPlan = {
  "id": "153",
  "pairs": 8,
  "bilder": [
    {
      "id": 0,
      "point": "Jede Person eigener Punkt",
      "title": "Einmarsch",
      "comment": "",
      "leaders": [
        [-3.5, -7],
        [-3.5, -6],
        [2.5, -6],
        [2.5, -7],
        [-1.5, -6],
        [0.5, -7],
        [0.5, -6],
        [-1.5, -7]
      ],
      "followers": [
        [1.5, -6],
        [-2.5, -6],
        [-2.5, -7],
        [-0.5, -7],
        [-0.5, -6],
        [1.5, -7],
        [3.5, -6],
        [3.5, -7]
      ]
    },
    {
      "id": 1,
      "point": "Jede Person eigener Punkt",
      "title": "Einmarsch - Kreis",
      "comment": "",
      "leaders": [
        [-2, -1],
        [-2, 1],
        [2, 1],
        [2, -1],
        [-1, 2],
        [1, -2],
        [1, 2],
        [-1, -2]
      ],
      "followers": [
        [3, 3],
        [-4, 0],
        [-3, 3],
        [-3, -3],
        [0, 4],
        [0, -4],
        [4, 0],
        [3, -3]
      ]
    },
    {
      "id": 2,
      "point": "Herr RF",
      "title": "Samba Pose",
      "comment": "",
      "leaders": [
        [-4, -2],
        [-3, -1],
        [-2, 0],
        [-1, -1],
        [-4, 0],
        [-1, -3],
        [-2, -2],
        [-3, -3]
      ]
    },
    {
      "id": 3,
      "point": "Herr LF",
      "title": "Beginn Jive",
      "comment": "",
      "leaders": [
        [-2, 1],
        [-1, 2],
        [0, 3],
        [1, 2],
        [-2, 3],
        [1, 0],
        [0, 1],
        [-1, 0]
      ]
    },
    {
      "id": 4,
      "point": "Herr RF, Dame LF",
      "title": "Jive",
      "comment": "",
      "leaders": [
        [0, 1],
        [1, 2],
        [2, 3],
        [4, 3],
        [0, 3],
        [4, 1],
        [3, 2],
        [2, 1]
      ],
      "followers": [
        [-5, 1],
        [-5, 2],
        [-4, 3],
        [-3, 3],
        [-5, 3],
        [-3, 1],
        [-3, 2],
        [-4, 1]
      ]
    },
    {
      "id": 5,
      "point": "Paarmitte",
      "title": "Jive - zusammen",
      "comment": "",
      "leaders": [
        [-1, 0],
        [-1, 2],
        [0, 3],
        [1, 4],
        [-1, 4],
        [1, 0],
        [1, 2],
        [0, 1]
      ]
    }
  ],
  "saved": "2026-03-30 19:15:52",
  "lastId": 5,
  "team": "",
  "loaded": "09:13:33",
  "changed": true
}

export const postPHP = (f, data, callback, errorCB=null) => {
	alert('upload für demo deaktiviert')
	// if(!checkUrlForQuery()) return;
	// let formData = new FormData();
	// for(let key in data) {
	// 	formData.append(key, data[key])
	// }
	// let url = urlForQuery + '?f=' + f;
	// fetch(url, {
	// 	method: "POST",
	// 	body: formData
	// })
	// 	.then(response => response.json())
	// 	.then(json => {
	//
	// 		if(json.success) callback(json.data);
	// 		else {
	// 			if(errorCB == null) console.log(json.data)
	// 			else errorCB(json.data);
	// 		}
	// 	})
	// 	.catch(typeof errorCB === 'function' ? errorCB : () => {})
}

export const queryPHP = (f, d, callback, errorCB=null) => {
	return demoPlan
	// if(!checkUrlForQuery()) return;
	// let data = {...d}
	// let url = urlForQuery + '?f=' + f;
	// for(let key in data) url += "&" + key + "=" + encodeURIComponent(data[key]);
	// console.log(url)
	// fetch(url)
	// 	.then(response => response.json())
	// 	.then(json => {
	//
	// 		if(json.success) callback(json.data);
	// 		else {
	// 			alert(json.data);
	// 		}
	// 	})
	// 	.catch(err => alert(err))
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
