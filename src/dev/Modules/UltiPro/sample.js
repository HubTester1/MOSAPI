
const performSideTasks = () => 
	someAsyncTask()
		.then((num) => {
			anotherTask(num);
			return num;
		});

const recursiveFunHouse = (num) => {
	performSideTasks()
		.then((newNum) => {
			if (newNum - num > 0) {
				recursiveFunHouse(newNum);
			} else {
				for (let i = 0; i < numList.length; i++) {
					console.log(numList[i]);
				}
			}
		});
};

recursiveFunHouse(10);
