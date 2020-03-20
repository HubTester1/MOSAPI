
// ReturnOnePageOfEmployeesFromUltiPro
// something async returning a promise
const asyncThing = (asyncParam) => 
	new Promise((resolve, reject) => {
		const timeOut = () => {
			// resolve with parameter value passed
			resolve(asyncParam);
		};
		setTimeout(timeOut, 1000);
	});

// RecursivelyGetAllPagesOfEmployeesFromUltiPro
// asynchronous recursive function
const recFun = (num) => {
	// process async result and decide what to do
	const decide = (asyncResult) => { 
		// if (asyncResult === 0) {
		// 	console.log('ignition');
		// }
		// decide if further recursion needed
		if (asyncResult < 0) {
			// all done
			return 'lift off';
		}
		// not all done, recurse
		return recFun(num - 1); 
	};

	// return a promise resolved by doing something async and deciding what to do with it
	// to be clear the returned promise is the one returned by .then
	return asyncThing(num).then(decide);
};

// call the recursive function
recFun(5)
	.then((result) => { 
		console.log(`done, result = ${result}`); 
	})
	.catch((err) => { 
		console.log(`oops:${err}`); 
	});
