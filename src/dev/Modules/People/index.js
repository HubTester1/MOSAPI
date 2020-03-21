/**
 * @name People
 * @service
 * @description Performs all people-related operations.
 */

const DataConnection = require('data-connection');
const DataQueries = require('data-queries');
const UltiPro = require('ultipro');
const MSGraph = require('ms-graph');
const Utilities = require('utilities');
const axios = require('axios');

module.exports = {

	// --- META

	/**
	 * @name ReturnPeopleSettings
	 * @function
	 * @async
	 * @description Return people settings from db.
	 */

	ReturnPeopleSettings: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all documents
			DataQueries.ReturnAllDocsFromCollection('_settingsPeople')
				// if the promise is resolved with the docs
				.then((result) => {
					// resolve this promise with the docs
					resolve(result);
				})
				// if the promise is rejected with an error
				.catch((error) => {
					// reject this promise with an error
					reject(error);
				});
		}),

	/**
	 * @name ReturnPeopleProcessingPermitted
	 * @function
	 * @async
	 * @description Return whether or not people processing is currently permitted.
	 * Changing this property in db will disallow or reallow people data processing.
	 */

	ReturnPeopleProcessingPermitted: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all settings
			module.exports.ReturnPeopleSettings()
				// if the promise is resolved with the settings
				.then((settings) => {
					resolve({
						error: settings.error,
						dataProcessingPermitted: settings.docs[0].dataProcessingPermitted,
					});
				})
				// if the promise is rejected with an error
				.catch((error) => {
					// reject this promise with an error
					reject(error);
				});
		}),

	/**
	 * @name ReturnPeopleWhitelistedDomains
	 * @function
	 * @async
	 * @description Return the domains that are whitelisted for the People API.
	 */

	ReturnPeopleWhitelistedDomains: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all settings
			module.exports.ReturnPeopleSettings()
				// if the promise is resolved with the settings
				.then((settings) => {
					resolve({
						error: settings.error,
						whitelistedDomains: settings.docs[0].whitelistedDomains,
					});
				})
				// if the promise is rejected with an error
				.catch((error) => {
					// reject this promise with an error
					reject(error);
				});
		}),

	// --- PARENT - execution begins here

	ProcessAllPeopleData: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve setting indicating whether 
			// 		people processing is permitted or not
			module.exports.ReturnPeopleProcessingPermitted()
				// if the promise was resolved
				.then((permittedResults) => {
					// if it's ok to process people
					if (permittedResults.dataProcessingPermitted) {
						// process in order of dependency
						// get a promise to perform all syncs
						module.exports.PerformAllDataSyncs()
							// if the promise is resolved with a result
							.then((syncResult) => {
								// get a promise to process divisions and departments
								Promise.all([
									module.exports.ProcessAllDivisions(),
									module.exports.ProcessAllDepartments(),
								])
									// if the promise is resolved with a result
									.then((divisionDepartmentResult) => {
										// get a promise to process all constituent people data 
										// 		into a flat array of people
										module.exports.ProcessPeopleFlat()
											// if the promise is resolved with a result
											.then((processPeopleFlatResult) => {
												// get a promise to process people by division and department
												module.exports.ProcessPeopleByDivisionsDepartments()
													// if the promise is resolved with a result
													.then((peopleByDivisionsDepartmentsResult) => {
														// get a promise to process managers' downlines
														Promise.all([
															module.exports.ProcessManagersWithFlatDownlines(),
															module.exports.ProcessManagersWithHierarchicalDownlines(),
														])
															// if the promise is resolved with a result
															.then((downlinesResults) => {
																resolve({ result: 'success' });
															})
															// if the promise is rejected with an error
															.catch((downlinesErrors) => {
																// reject this promise with an error
																reject(downlinesErrors);
															});
													})
													// if the promise is rejected with an error
													.catch((peopleByDivisionsDepartmentsError) => {
														// reject this promise with an error
														reject(peopleByDivisionsDepartmentsError);
													});
											})
											// if the promise is rejected with an error
											.catch((processPeopleFlatError) => {
												// reject this promise with an error
												reject(processPeopleFlatError);
											});
									})
									// if the promise is rejected with an error
									.catch((divisionDepartmentError) => {
										// reject this promise with an error
										reject(divisionDepartmentError);
									});
							})
							// if the promise is rejected with an error
							.catch((syncError) => {
								// reject this promise with an error
								reject(syncError);
							});

						// if it's NOT ok to process people
					} else {
						// reject this promise with an error
						reject({ error: 'data processing not permitted now' });
					}
				})
				// if the promise is rejected with an error
				.catch((permittedError) => {
					// reject this promise with an error
					reject({ error: 'data processing not permitted now' });
				});
		}),

	// ----- SYNC DATA

	/**
	 * @name PerformAllDataSyncs
	 * @function
	 * @async
	 * @description Sync (delete, fetch, insert) all raw data sets.
	 */

	PerformAllDataSyncs: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get promises to sync specific raw data sets
			Promise.all([
				module.exports.PerformSpecifiedDataSync('nesoPeople'),
				module.exports.PerformSpecifiedDataSync('ultiProActiveEmployees'),
				module.exports.PerformSpecifiedDataSync('graphGroups'),
				module.exports.PerformSpecifiedDataSync('hubAdmins'),
				module.exports.PerformSpecifiedDataSync('edgeCaseManagers'),
			])
				// if all of those promises were resolved
				.then((syncResults) => {
					// resolve this promise
					resolve(syncResults);
				})
				// if any one promise is rejected with an error
				.catch((syncError) => {
					// reject this promise with that error
					reject(syncError);
				});
		}),

	/**
	 * @name PerformSpecifiedDataSync
	 * @function
	 * @async
	 * @description Sync (delete, fetch, insert) a specific set of raw data.
	 * @param {string} dataSetToken - e.g., 'ultiProActiveEmployees', 'graphGroups', 'hubAdmins'
	 */

	PerformSpecifiedDataSync: (dataSetToken) =>
		// return a new promise
		new Promise((resolve, reject) => {
			let collectionName = '';
			switch (dataSetToken) {
			case 'nesoPeople':
				collectionName = '__syncedPeopleTempNesoAD';
				break;
			case 'ultiProActiveEmployees':
				collectionName = '__syncedPeopleUltiProActiveEmployees';
				break;
			case 'graphGroups':
				collectionName = 'peopleMSGraphGroups';
				break;
			case 'hubAdmins':
				collectionName = '__syncedPeopleMSGraphHubComponentGroupAdmins';
				break;
			case 'edgeCaseManagers':
				collectionName = '__syncedPeopleTempEdgeCaseManagers';
				break;
			default:
				break;
			}
			// get a promise to delete all documents
			DataQueries.DeleteAllDocsFromCollection(collectionName)
				// if the promise is resolved with the result
				.then((deletionResult) => {
					// set up a container for promises to add data
					const additionPromises = [];
					switch (dataSetToken) {
					case 'nesoPeople':
						additionPromises.push(
							module.exports.AddAllNesoPeopleToDatabase(),
						);
						break;
					case 'ultiProActiveEmployees':
						additionPromises.push(
							module.exports.AddAllUltiProActiveEmployeesToDatabase(),
						);
						break;
					case 'graphGroups':
						additionPromises.push(
							module.exports.AddTrackedMSGraphGroupsToDatabase(),
						);
						break;
					case 'hubAdmins':
						additionPromises.push(
							module.exports.AddHubComponentGroupAdminsToDatabase(),
						);
						break;
					case 'edgeCaseManagers':
						additionPromises.push(
							module.exports.AddTempEdgeCaseManagersToDatabase(),
						);
						break;
					default:
						break;
					}
					Promise.all(additionPromises)
						// if the promise is resolved with the result
						.then((insertionResult) => {
							// resolve this promise with the result
							resolve(insertionResult);
						})
						// if the promise is rejected with an error
						.catch((insertionError) => {
							//  reject this promise with an error
							reject(insertionError);
						});
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((deletionError) => {
					reject(deletionError);
				});
		}),

	AddAllNesoPeopleToDatabase: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to 
			axios.get('https://neso.mos.org/activeDirectory/users')
				// if the promise is resolved with a result
				.then((queryResult) => {
					const allNesoEmployees = [];
					queryResult.data.docs.forEach((employee) => {
						const employeeToPush = {
							account: Utilities
								.ReturnSubstringPrecedingNewLineCharacters(employee.account),
							department: Utilities
								.ReturnSubstringPrecedingNewLineCharacters(employee.department),
							division: Utilities
								.ReturnSubstringPrecedingNewLineCharacters(employee.division),
						};
						allNesoEmployees.push(employeeToPush);
					});
					// get a promise to insert
					DataQueries.InsertDocIntoCollection(allNesoEmployees, '__syncedPeopleTempNesoAD')
						// if the promise is resolved with the result, then resolve this promise with the result
						.then((insertResult) => {
							resolve(insertResult);
						})
						// if the promise is rejected with an error, then reject this promise with an error
						.catch((insertError) => {
							reject(insertError);
						});
				})
				// if the promise is rejected with an error
				.catch((nesoError) => {
					// reject this promise with the error
					reject(nesoError);
				});
		}),

	/**
	 * @name AddAllUltiProActiveEmployeesToDatabase
	 * @function
	 * @async
	 * @description Get all active employees via UltiPro service. 
	 * Insert into '__syncedPeopleUltiProActiveEmployees' collection.
	 */

	AddAllUltiProActiveEmployeesToDatabase: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			const allEmployees = [];
			// get a promise to get all employees from UltiPro
			UltiPro.RecursivelyGetAllPagesOfEmployeesFromUltiPro(1, allEmployees)
				// if the promise is resolved with the result, then resolve this promise with the result
				.then((queryResult) => {
					const allActiveEmployees = [];
					queryResult.forEach((employee) => {
						if (employee.isActive && employee.orgLevel1Code) {
							let phoneToUse = '';
							if (
								employee.workPhone &&
								employee.workPhone.replace(/ /g, '')
							) {
								phoneToUse =
									`${employee.workPhone.slice(0, 3)}-${employee.workPhone.slice(3, 6)}-${employee.workPhone.trim().slice(6)}`;
							}
							let jobTitleToUse = '';
							if (employee.alternateJobTitle) {
								jobTitleToUse = employee.alternateJobTitle;
							} else {
								jobTitleToUse = employee.jobTitle;
							}
							const employeeToPush = {
								account: Utilities
									.ReturnAccountFromUserAndDomain(employee.emailAddress),
								firstName:
									Utilities.ReturnSubstringPrecedingNewLineCharacters(employee.firstName),
								lastName:
									Utilities.ReturnSubstringPrecedingNewLineCharacters(employee.lastName),
								preferredName:
									Utilities.ReturnSubstringPrecedingNewLineCharacters(employee.preferredName),
								jobTitle: Utilities.ReturnSubstringPrecedingNewLineCharacters(jobTitleToUse),
								email:
									Utilities.ReturnSubstringPrecedingNewLineCharacters(employee.emailAddress),
								phone:
									Utilities.ReturnSubstringPrecedingNewLineCharacters(phoneToUse),
								mosEmployeeID:
									Utilities.ReturnSubstringPrecedingNewLineCharacters(employee.employeeNumber),
								upEmployeeID:
									Utilities.ReturnSubstringPrecedingNewLineCharacters(employee.employeeId),
								upSupervisorId:
									Utilities.ReturnSubstringPrecedingNewLineCharacters(employee.supervisorId),
								projectCode:
									Utilities.ReturnSubstringPrecedingNewLineCharacters(employee.projectCode),
								orgLevel1Code:
									Utilities.ReturnSubstringPrecedingNewLineCharacters(employee.orgLevel1Code),
								orgLevel2Code:
									Utilities.ReturnSubstringPrecedingNewLineCharacters(employee.orgLevel2Code),
								orgLevel3Code:
									Utilities.ReturnSubstringPrecedingNewLineCharacters(employee.orgLevel3Code),
								orgLevel4Code:
									Utilities.ReturnSubstringPrecedingNewLineCharacters(employee.orgLevel4Code),
								jobGroupCode:
									Utilities.ReturnSubstringPrecedingNewLineCharacters(employee.jobGroupCode),
							};
							allActiveEmployees.push(employeeToPush);
						}
					});
					// get a promise to insert
					DataQueries.InsertDocIntoCollection(allActiveEmployees, '__syncedPeopleUltiProActiveEmployees')
						// if the promise is resolved with the result, then resolve this promise with the result
						.then((insertResult) => {
							resolve(insertResult);
						})
						// if the promise is rejected with an error, then reject this promise with an error
						.catch((insertError) => {
							reject(insertError);
						});
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((queryError) => {
					reject(queryError);
				});
		}),

	/**
	 * @name AddTrackedMSGraphGroupsToDatabase
	 * @function
	 * @async
	 * @description Find out from people settings which AD groups 
	 * we're tracking and then get those group's info via Graph.
	 * Insert into 'peopleMSGraphGroups' collection.
	 */

	AddTrackedMSGraphGroupsToDatabase: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// set up var to contain all tracked groups with their members
			const allTrackedGroupsWithMembers = [];
			// set up group membership query promises container
			const allGroupMembershipQueryPromises = [];
			// get a promise to get IDs for all of the groups we're tracking
			DataQueries.ReturnAllDocsFromCollection('_settingsPeople')
				// if the promise was resolved with the tracked groups
				.then((peopleSettingsResult) => {
					// for each tracked group
					peopleSettingsResult.docs[0].groupsTracked.forEach((trackedGroup) => {
						// add to membership query promises container a promise to get the group's members
						allGroupMembershipQueryPromises
							.push(
								MSGraph.ReturnAllSpecifiedDataFromGraph(
									`groups/${trackedGroup.graphID}/transitiveMembers?$select=userPrincipalName`,
								),
							);
					});
					// when all group membership query promises are resolved
					Promise.all(allGroupMembershipQueryPromises)
						.then((allGroupMembershipQueryResults) => {
							peopleSettingsResult.docs[0].groupsTracked
								.forEach((trackedGroupValue, trackedGroupIndex) => {
									const groupToPush = {
										groupName: trackedGroupValue.displayName,
										members: [],
									};
									allGroupMembershipQueryResults[trackedGroupIndex].allValues
										.forEach((memberValue) => {
											groupToPush.members.push(
												Utilities.ReturnAccountFromUserAndDomain(memberValue.userPrincipalName),
											);
										});
									allTrackedGroupsWithMembers.push(groupToPush);
								});
							// get a promise to retrieve all documents from the emailQueue document collection
							DataQueries.InsertDocIntoCollection(
								allTrackedGroupsWithMembers,
								'peopleMSGraphGroups',
							)
								// if the promise is resolved with the result
								.then((insertResult) => {
									// resolve this promise with the result
									resolve(insertResult);
								})
								// if the promise is rejected with an error, then reject this promise with an error
								.catch((insertError) => {
									reject(insertError);
								});
						});
				})
				// if the promise is rejected with an error
				.catch((peopleSettingsError) => {
					// reject this promise with an error
					reject(peopleSettingsError);
				});
		}),

	/**
	 * @name AddHubComponentGroupAdminsToDatabase
	 * @function
	 * @async
	 * @description Get The Hub's Component Group Admins from SPO via Graph.
	 * Insert into '__syncedPeopleMSGraphHubComponentGroupAdmins' collection.
	 */

	AddHubComponentGroupAdminsToDatabase: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to return the items from the 'Component Group Log' list in 'hubprod' site
			MSGraph.ReturnAllSpecifiedDataFromGraph('sites/bmos.sharepoint.com,83c7fe0f-025f-43a2-986c-cb8cb6ee600f,cb940f09-8f4d-4384-a92b-24c2e4c5a290/lists/%7B8b05efe6-bb95-4943-8929-6d196007ff28%7D/items?expand=fields(select=Title,GroupAdminAccess)')
				// if the promise is resolved with the result, then resolve this promise with the result
				.then((queryResult) => {
					// set up var to contain all of the component groups and their admins
					const groupsAndAdmins = [];
					// iterate over query result
					queryResult.allValues.forEach((listItem) => {
						const groupAndAdminToPush = {
							componentGroupName: listItem.fields.Title,
							admins: [],
						};
						listItem.fields.GroupAdminAccess.forEach((groupAdminAccessPerson) => {
							groupAndAdminToPush.admins.push(
								Utilities.ReturnAccountFromUserAndDomain(groupAdminAccessPerson.Email),
							);
						});
						groupsAndAdmins.push(groupAndAdminToPush);
					});
					// get a promise to insert the component groups and their admins
					DataQueries.InsertDocIntoCollection(groupsAndAdmins, '__syncedPeopleMSGraphHubComponentGroupAdmins')
						// if the promise is resolved with the result
						.then((insertResult) => {
							// resolve this promise with the result
							resolve(insertResult);
						})
						// if the promise is rejected with an error
						.catch((insertError) => {
							// reject this promise with an error
							reject(insertError);
						});
				})
				// if the promise is rejected with an error
				.catch((queryError) => {
					// reject this promise with an error
					reject(queryError);
				});
		}),

	/**
	 * @name AddHubComponentGroupAdminsToDatabase
	 * @function
	 * @async
	 * @description Get The Hub's Component Group Admins from SPO via Graph.
	 * Insert into '__syncedPeopleMSGraphHubComponentGroupAdmins' collection.
	 */

	AddTempEdgeCaseManagersToDatabase: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to return the items from the 'Component Group Log' list in 'hubprod' site
			MSGraph.ReturnAllSpecifiedDataFromGraph('sites/bmos.sharepoint.com,83c7fe0f-025f-43a2-986c-cb8cb6ee600f,cb940f09-8f4d-4384-a92b-24c2e4c5a290/lists/59cd4336-bd10-4ac0-a6c4-239ea93e3ebc/items?expand=fields(select=Title)')
				// if the promise is resolved with the result, then resolve this promise with the result
				.then((queryResult) => {
					// set up var to contain all of the component groups and their admins
					const managers = [];
					// iterate over query result
					queryResult.allValues.forEach((listItem) => {
						managers.push({ account: listItem.fields.Title });
					});
					// get a promise to insert the component groups and their admins
					DataQueries.InsertDocIntoCollection(managers, '__syncedPeopleTempEdgeCaseManagers')
						// if the promise is resolved with the result
						.then((insertResult) => {
							// resolve this promise with the result
							resolve(insertResult);
						})
						// if the promise is rejected with an error
						.catch((insertError) => {
							// reject this promise with an error
							reject(insertError);
						});
				})
				// if the promise is rejected with an error
				.catch((queryError) => {
					// reject this promise with an error
					reject(queryError);
				});
		}),

	// --- PROCESS DATA

	ProcessAllDivisions: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get promises to get all of the relevant raw data
			Promise.all([
				DataQueries.ReturnAllDocsFromCollection('__syncedPeopleUltiProActiveEmployees'),
				DataQueries.ReturnAllDocsFromCollection('__syncedPeopleTempNesoAD'),
			])
				// if the promise is resolved
				.then((queryResults) => {
					// extract results for convenience
					const employees = queryResults[0].docs;
					const nesoPeople = queryResults[1].docs;
					const divisionsHandled = [];
					const allDivisions = [];
					// iterate over employees
					employees.forEach((employee) => {
						// if employee has a division code
						if (employee.orgLevel1Code) {
							// if this employee's division code has not already been handled
							if (!divisionsHandled.includes(employee.orgLevel1Code)) {
								// iterate over neso people
								nesoPeople.forEach((nesoPerson) => {
									// if this neso person's account matches this employee's account
									if (nesoPerson.account === employee.account) {
										// add this employee's division code to the array
										// 		of those that have been handled
										divisionsHandled.push(employee.orgLevel1Code);
										// add this employee's division code and division name
										// 		to the array of all divisions
										allDivisions.push({
											orgLevel1Code: employee.orgLevel1Code,
											name: Utilities.ReplaceAll('\\.', '', nesoPerson.division),
											nameWithCode: `${employee.orgLevel1Code} - ${Utilities.ReplaceAll('\\.', '', nesoPerson.division)}`,
										});
									}
								});
							}
						}
					});
					// alphabetize array by division name
					allDivisions.sort(module.exports.ReturnDivisionOrDepartmentNameWeightRelativeToAnother);
					// get a promise to delete all documents
					DataQueries.DeleteAllDocsFromCollection('peopleDivisions')
						// if the promise is resolved with the result
						.then((deletionResult) => {
							// get a promise to insert allPeople
							DataQueries.InsertDocIntoCollection(
								allDivisions,
								'peopleDivisions',
							)
								// if the promise is resolved with the result
								.then((insertResult) => {
									// resolve this promise with the result
									resolve(insertResult);
								})
								// if the promise is rejected with an error
								.catch((insertError) => {
									// reject this promise with an error
									reject(insertError);
								});
						})
						// if the promise is rejected with an error
						.catch((deletionError) => {
							// reject this promise with an error
							reject(deletionError);
						});
				})
				// if the promise is rejected with an error
				.catch((returnDataError) => {
					// reject this promise with the error
					reject(returnDataError);
				});
		}),

	ProcessAllDepartments: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get promises to get all of the relevant raw data
			Promise.all([
				DataQueries.ReturnAllDocsFromCollection('__syncedPeopleUltiProActiveEmployees'),
				DataQueries.ReturnAllDocsFromCollection('__syncedPeopleTempNesoAD'),
			])
				// if the promise is resolved
				.then((queryResults) => {
					// extract results for convenience
					const employees = queryResults[0].docs;
					const nesoPeople = queryResults[1].docs;
					const departmentsHandled = [];
					const allDepartments = [];
					// iterate over employees
					employees.forEach((employee) => {
						// if employee has a department code
						if (employee.orgLevel2Code) {
							// if this employee's department code has not already been handled
							if (!departmentsHandled.includes(employee.orgLevel2Code)) {
								// iterate over neso people
								nesoPeople.forEach((nesoPerson) => {
									// if this neso person's account matches this employee's account
									if (nesoPerson.account === employee.account) {
										// add this employee's department code to the array
										// 		of those that have been handled
										departmentsHandled.push(employee.orgLevel2Code);
										// add this employee's department code and department name
										// 		to the array of all departments
										allDepartments.push({
											orgLevel2Code: employee.orgLevel2Code,
											name: Utilities.ReplaceAll('\\.', '', nesoPerson.department),
											nameWithCode: `${employee.orgLevel2Code} - ${Utilities.ReplaceAll('\\.', '', nesoPerson.department)}`,
										});
									}
								});
							}
						}
					});
					// alphabetize array by department name
					allDepartments.sort(module.exports.ReturnDivisionOrDepartmentNameWeightRelativeToAnother);
					// get a promise to delete all documents
					DataQueries.DeleteAllDocsFromCollection('peopleDepartments')
						// if the promise is resolved with the result
						.then((deletionResult) => {
							// get a promise to insert allPeople
							DataQueries.InsertDocIntoCollection(
								allDepartments,
								'peopleDepartments',
							)
								// if the promise is resolved with the result
								.then((insertResult) => {
									// resolve this promise with the result
									resolve(insertResult);
								})
								// if the promise is rejected with an error
								.catch((insertError) => {
									// reject this promise with an error
									reject(insertError);
								});
						})
						// if the promise is rejected with an error
						.catch((deletionError) => {
							// reject this promise with an error
							reject(deletionError);
						});
				})
				// if the promise is rejected with an error
				.catch((returnDataError) => {
					// reject this promise with the error
					reject(returnDataError);
				});
		}),

	/**
	 * @name ProcessPeopleFlat
	 * @function
	 * @async
	 * @description Construct flat set of individual people. 
	 * Insert into 'peopleFlat' collection. This is the base people data set.
	 */

	ProcessPeopleFlat: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get promises to get all of the relevant raw data
			Promise.all([
				DataQueries.ReturnAllDocsFromCollection('_settingsPeople'),
				DataQueries.ReturnAllDocsFromCollection('peoplePreferences'),
				DataQueries.ReturnAllDocsFromCollection('peopleMSGraphGroups'),
				DataQueries.ReturnAllDocsFromCollection('__syncedPeopleMSGraphHubComponentGroupAdmins'),
				DataQueries.ReturnAllDocsFromCollection('__syncedPeopleUltiProActiveEmployees'),
				DataQueries.ReturnAllDocsFromCollection('__syncedPeopleTempEdgeCaseManagers'),
				DataQueries.ReturnAllDocsFromCollection('peopleDivisions'),
				DataQueries.ReturnAllDocsFromCollection('peopleDepartments'),
			])
				// if the promise is resolved
				.then((queryResults) => {
					// extract results for convenience
					const groupSettings = queryResults[0].docs[0].groupsTracked;
					const preferences = queryResults[1].docs;
					const groups = queryResults[2].docs;
					const componentGroupAdmins = queryResults[3].docs;
					const employees = queryResults[4].docs;
					const edgeCaseManagers = queryResults[5].docs;
					const divisions = queryResults[6].docs;
					const departments = queryResults[7].docs;
					// set up container for all people
					const allPeople = [];
					// iterate over each employee
					employees.forEach((employee) => {
						// set up default manager for this employee
						let thisEmpoyeeManager = null;
						// find this employee's manager
						// iterate over employees again
						employees.forEach((subEmployeeOne) => {
							// if this subEmployee's ultipro employee ID matches
							// 		this employee's supervisor's ultipro supervisor ID
							if (subEmployeeOne.upEmployeeID === employee.upSupervisorId) {
								// set the manager for this employee to the subEmployee's account
								thisEmpoyeeManager = subEmployeeOne.account;
							}
						});
						// get flag indicating whether or not this person is a manager
						const thisEmpoyeeIsManager =
							module.exports.ReturnPersonIsManager(
								employee.upEmployeeID,
								employee.account,
								employees,
								edgeCaseManagers,
							);

						// construct this person from the ultipro employee data;
						// 		some of these properties are named for backward compatibility
						const thisEmployee = {
							account: employee.account,
							employeeID: employee.mosEmployeeID,
							firstName: employee.firstName,
							lastName: employee.lastName,
							preferredName: employee.preferredName,
							firstInitial: employee.preferredName ?
								employee.preferredName.slice(0, 1).toUpperCase() :
								employee.firstName.slice(0, 1).toUpperCase(),
							lastInitial: employee.lastName.slice(0, 1).toUpperCase(),
							displayName: employee.preferredName ?
								`${employee.preferredName} ${employee.lastName}` :
								`${employee.firstName} ${employee.lastName}`,
							title: employee.jobTitle,
							email: employee.email,
							officePhone: employee.phone,
							manager: thisEmpoyeeManager,
							department:
								departments.find((element) =>
									element.orgLevel2Code === employee.orgLevel2Code)
									.name,
							division:
								divisions.find((element) =>
									element.orgLevel1Code === employee.orgLevel1Code)
									.name,
							jobGroupCode: employee.jobGroupCode,
						};
						// set up a container for this person's potential roles
						const thisEmployeeRoles = [];
						// if flag indicates this person is manager
						if (thisEmpoyeeIsManager) {
							// add the manager role to this 
							thisEmployeeRoles.push('manager');
						}
						// iterate over the groups
						groups.forEach((group) => {
							// iterate over this group's members
							group.members.forEach((member) => {
								// if this group member matches this person
								if (member === thisEmployee.account) {
									// iterate over all groups' settings
									groupSettings.forEach((settingsOneGroup) => {
										// if the displayName in this group's settings
										// 		matches the 
										if (settingsOneGroup.displayName === group.groupName) {
											thisEmployeeRoles.push(
												settingsOneGroup.roleForGroupMembers,
											);
										}
									});
								}
							});
						});
						// iterate over the component group admins
						componentGroupAdmins.forEach((componentGroup) => {
							// iterate over this component group's admins
							componentGroup.admins.forEach((componentGroupAdmin) => {
								// if this component group admin matches this person
								if (componentGroupAdmin === thisEmployee.account) {
									thisEmployeeRoles
										.push(
											`componentGroupAdmin${
												componentGroup.componentGroupName.replace(' ', '')}`,
										);
								}
							});
						});
						// if any roles were found for this person
						if (thisEmployeeRoles[0]) {
							// add them to thisEmployee
							thisEmployee.roles = thisEmployeeRoles;
						}
						// iterate over the preferences
						preferences.forEach((preferencesSet) => {
							// if this preference set's account matches this person
							if (preferencesSet.account === thisEmployee.account) {
								// make a copy of this preferenc set
								const preferencesSetCopy =
									Utilities.ReturnCopyOfObject(preferencesSet);
								// delete the _id and account properties of this preference set copy
								delete preferencesSetCopy.account;
								delete preferencesSetCopy._id;
								// set this person's preferences to the modified preference set copy
								thisEmployee.preferences = preferencesSetCopy;
							}
						});

						// push this person to allPeople
						allPeople.push(thisEmployee);
					});
					// alphabetize the people
					allPeople.sort(module.exports.ReturnPersonNameWeightRelativeToAnother);
					// get a promise to delete all documents
					DataQueries.DeleteAllDocsFromCollection('peopleFlat')
						// if the promise is resolved with the result
						.then((deletionResult) => {
							// get a promise to insert allPeople
							DataQueries.InsertDocIntoCollection(
								allPeople,
								'peopleFlat',
							)
								// if the promise is resolved with the result
								.then((insertResult) => {
									// resolve this promise with the result
									resolve(insertResult);
								})
								// if the promise is rejected with an error
								.catch((insertError) => {
									// reject this promise with an error
									reject(insertError);
								});
						})
						// if the promise is rejected with an error
						.catch((deletionError) => {
							// reject this promise with an error
							reject(deletionError);
						});
				})
				// if the promise is rejected with an error
				.catch((returnDataError) => {
					// reject this promise with an error
					reject(returnDataError);
				});
		}),

	ProcessPeopleByDivisionsDepartments: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all docs
			DataQueries.ReturnAllDocsFromCollection('peopleFlat')
				// if the promise is resolved with the docs
				.then((queryResult) => {
					// extract the data from the result
					const peopleFlat = queryResult.docs;
					// set up empty object to receive the new data
					const peopleByDivisionsDepartments = {};
					// iterate over peopleFlat
					peopleFlat.forEach((person, personIndex) => {
						// if this user has a division and department
						if (person.division && person.department) {
							// extract division and department names for convenient use as keys
							const personDivision = person.division;
							const personDepartment = person.department;
							// if this user's division is not already in peopleByDivisionsDepartments
							if (typeof (peopleByDivisionsDepartments[personDivision]) === 'undefined') {
								// add it as an empty object
								peopleByDivisionsDepartments[personDivision] = {};
							}
							// if this user's department is not already in peopleByDivisionsDepartments
							if (typeof (peopleByDivisionsDepartments[personDivision][personDepartment]) === 'undefined') {
								// add it as an empty object
								peopleByDivisionsDepartments[personDivision][personDepartment] = {};
								// and add the empty "managers" array to the department
								peopleByDivisionsDepartments[personDivision][personDepartment].managers = [];
								// and add the empty "members" array to the department
								peopleByDivisionsDepartments[personDivision][personDepartment].members = [];
							}
							// add this user to the department
							peopleByDivisionsDepartments[personDivision][personDepartment]
								.members.push(person);
							// determine whether or not this user's manager 
							// 		is already in peopleByDivisionsDepartments
							// if this user's manager exists
							if (person.roles && person.roles.includes('manager')) {
								peopleByDivisionsDepartments[personDivision][personDepartment]
									.managers.push(person);
							}
						}
					});
					// alphabetize everything:
					// set up container for alphabetized object
					const peopleByDivisionsDepartmentsAlphabetized = {};
					// set up intermediate arrays of divisions and departments names for sorting
					const divisionsKeysArray = Object.keys(peopleByDivisionsDepartments);
					// alphabetize division keys
					divisionsKeysArray.sort();
					// for each division key
					divisionsKeysArray.forEach((divisionKey) => {
						const thisDivisionAlphabetizedDepartmentSet = {};
						const thisDivisionDepartmentKeys =
							Object.keys(peopleByDivisionsDepartments[divisionKey]);
						// alphabetize this division's department keys
						thisDivisionDepartmentKeys.sort();
						// for each department in this division object
						thisDivisionDepartmentKeys.forEach((departmentKey) => {
							thisDivisionAlphabetizedDepartmentSet[departmentKey] =
								peopleByDivisionsDepartments[divisionKey][departmentKey];
						});
						peopleByDivisionsDepartmentsAlphabetized[divisionKey] =
							thisDivisionAlphabetizedDepartmentSet;
					});
					// get a promise to delete all documents
					DataQueries.DeleteAllDocsFromCollection('peopleByDivisionsDepartments')
						// if the promise is resolved with the result
						.then((deletionResult) => {
							// get a promise to insert allPeople
							DataQueries.InsertDocIntoCollection(
								peopleByDivisionsDepartmentsAlphabetized,
								'peopleByDivisionsDepartments',
							)
								// if the promise is resolved with the result
								.then((insertResult) => {
									// resolve this promise with the result
									resolve(insertResult);
								})
								// if the promise is rejected with an error
								.catch((insertError) => {
									// reject this promise with an error
									reject(insertError);
								});
						})
						// if the promise is rejected with an error
						.catch((deletionError) => {
							// reject this promise with an error
							reject(deletionError);
						});
				})
				// if the promise is rejected with an error
				.catch((queryError) => {
					// reject this promise with an error
					reject(queryError);
				});
		}),

	ProcessManagersWithFlatDownlines: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get promises to retrieve people in a division and department hierarchy object
			// 		and as a flat array
			Promise.all([
				DataQueries.ReturnAllDocsFromCollection('peopleByDivisionsDepartments'),
				DataQueries.ReturnAllDocsFromCollection('peopleFlat'),
			])
				// when all promises have resolved
				.then((queryResults) => {
					// extract results for convenience
					const peopleByDivDept = queryResults[0].docs[0];
					const peopleFlat = queryResults[1].docs;
					delete peopleByDivDept._id;
					// set up empty array to receive the final data
					const allManagers = [];
					// iterate over the array of peopleByDivDept's property keys
					Object.keys(peopleByDivDept).forEach((divisionKey) => {
						// iterate over the array of this division object's property keys 
						// 		(department names)
						Object.keys(peopleByDivDept[divisionKey]).forEach((departmentKey) => {
							// if this department has managers
							if (peopleByDivDept[divisionKey][departmentKey].managers) {
								// for each manager in this department
								peopleByDivDept[divisionKey][departmentKey].managers
									.forEach((managerProfile) => {
										// preserve function param
										const manager = Utilities.ReturnUniqueObjectGivenAnyValue(
											JSON.stringify(managerProfile),
										);
										// delete the Mongo ID
										delete manager._id;
										// set flag indicating that this manager hasn't
										// 		already beed added to the final data
										let thisManagerAlreadyAdded = false;
										// iterate over managers already added to the final data
										allManagers.forEach((addedManagerProfile) => {
											// if this already-added manager is the same as 
											// 		this department's manager
											if (
												manager && manager.account ===
												addedManagerProfile.account
											) {
												// modify flag to indicate that 
												// 		this department's manager was 
												// already added
												thisManagerAlreadyAdded = true;
											}
										});
										// if this manager hasn't already been added
										if (!thisManagerAlreadyAdded) {
											// set up vars:
											// empty object to receive everyone 
											// 		who reports to this manager, 
											// 		structured by divisions and departments
											const downline = [];
											// array of users for whom to look up reportees
											const lookupsToBeProcessed = [manager.account];
											// array of users for whom we've already 
											// 		looked up reportees
											const lookupsProcessed = [];
											// while there is a difference in 
											// 		lookups to be processed and 
											// 		those already processed
											while (lookupsToBeProcessed.length !== lookupsProcessed.length) {
												// for each users for whom we should look up reportees
												// eslint-disable-next-line no-loop-func
												lookupsToBeProcessed.forEach((lookupToProcess) => {
													// if we haven't already processed this lookup
													if (lookupsProcessed.indexOf(lookupToProcess) === -1) {
														// for each user in the flat list of users
														peopleFlat.forEach((personProfile) => {
															// if this user reports to this manager
															if (personProfile.manager === lookupToProcess) {
																// preserve function param
																const person = Utilities.ReturnUniqueObjectGivenAnyValue(
																	JSON.stringify(personProfile),
																);
																// delete the Mongo ID
																delete person._id;
																// add this user to downline
																downline.push(person);
																// add this user to lookupsToBeProcessed, 
																// 		so that we'll also look up 
																// 		reportees for this user
																lookupsToBeProcessed.push(person.account);
															}
														});
														// whether or not any reportees were 
														// 		found, signify that we performed 
														// 		the lookup for this manager
														lookupsProcessed.push(lookupToProcess);
													}
												});
											}
											// alphabetize the downline
											downline.sort(module.exports.ReturnUserNameWeightRelativeToAnother);
											// add downline to this manager
											manager.downline = downline;
											// push this manager to the final data
											allManagers.push(manager);
										}
									});
							}
						});
					});
					// alphabetize the managers
					allManagers.sort(module.exports.ReturnPersonNameWeightRelativeToAnother);
					// get a promise to delete all documents
					DataQueries.DeleteAllDocsFromCollection('peopleManagersWithFlatDownlines')
						// if the promise is resolved with the result
						.then((deletionResult) => {
							// get a promise to insert allPeople
							DataQueries.InsertDocIntoCollection(
								allManagers,
								'peopleManagersWithFlatDownlines',
							)
								// if the promise is resolved with the result
								.then((insertResult) => {
									// resolve this promise with the result
									resolve(insertResult);
								})
								// if the promise is rejected with an error
								.catch((insertError) => {
									// reject this promise with an error
									reject(insertError);
								});
						})
						// if the promise is rejected with an error
						.catch((deletionError) => {
							// reject this promise with an error
							reject(deletionError);
						});
				})
				// if the promise to get all ad users from csv was rejected with an error
				.catch((queryError) => {
					// reject this promise with the error
					reject(queryError);
				});
		}),

	ProcessManagersWithHierarchicalDownlines: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get promises to retrieve people in a division and department hierarchy object
			// 		and as a flat array
			Promise.all([
				DataQueries.ReturnAllDocsFromCollection('peopleByDivisionsDepartments'),
				DataQueries.ReturnAllDocsFromCollection('peopleFlat'),
			])
				// when all promises have resolved
				.then((queryResults) => {
					// extract results for convenience
					const peopleByDivDept = queryResults[0].docs[0];
					const peopleFlat = queryResults[1].docs;
					delete peopleByDivDept._id;
					// set up empty array to receive the final data
					const allManagers = [];
					// iterate over the array of peopleByDivDept's property keys
					Object.keys(peopleByDivDept).forEach((divisionKey) => {
						// iterate over the array of this division object's property keys 
						// 		(department names)
						Object.keys(peopleByDivDept[divisionKey]).forEach((departmentKey) => {
							// if this department has managers
							if (peopleByDivDept[divisionKey][departmentKey].managers) {
								// for each manager in this department
								peopleByDivDept[divisionKey][departmentKey].managers
									.forEach((managerProfile) => {
										// preserve function param
										const manager = Utilities.ReturnUniqueObjectGivenAnyValue(
											JSON.stringify(managerProfile),
										);
										// delete the Mongo ID
										delete manager._id;
										// set flag indicating that this manager hasn't
										// 		already beed added to the final data
										let thisManagerAlreadyAdded = false;
										// iterate over managers already added to the final data
										allManagers.forEach((addedManagerProfile) => {
											// if this already-added manager is the same as 
											// 		this department's manager
											if (
												manager && manager.account ===
												addedManagerProfile.account
											) {
												// modify flag to indicate that 
												// 		this department's manager was 
												// already added
												thisManagerAlreadyAdded = true;
											}
										});
										// if this manager hasn't already been added
										if (!thisManagerAlreadyAdded) {
											// set up vars:
											// empty object to receive everyone 
											// 		who reports to this manager, 
											// 		structured by divisions and departments
											const downline = {};
											// array of users for whom to look up reportees
											const lookupsToBeProcessed = [manager.account];
											// array of users for whom we've already 
											// 		looked up reportees
											const lookupsProcessed = [];
											// while there is a difference in 
											// 		lookups to be processed and 
											// 		those already processed
											while (lookupsToBeProcessed.length !== lookupsProcessed.length) {
												// for each users for whom we should look up reportees
												// eslint-disable-next-line no-loop-func
												lookupsToBeProcessed.forEach((lookupToProcess) => {
													// if we haven't already processed this lookup
													if (lookupsProcessed.indexOf(lookupToProcess) === -1) {
														// for each user in the flat list of users
														peopleFlat.forEach((personProfile) => {
															// if this user reports to this manager
															if (personProfile.manager === lookupToProcess) {
																// preserve function param
																const person = Utilities.ReturnUniqueObjectGivenAnyValue(
																	JSON.stringify(personProfile),
																);
																// delete the Mongo ID
																delete person._id;
																// if this user's division is not already in downline
																if (!downline[person.division]) {
																	// add it as an empty object
																	downline[person.division] = {};
																}
																// if this user's department is not already in downline
																if (!downline[person.division][person.department]) {
																	// add it as an empty array
																	downline[person.division][person.department] = [];
																}
																// add this user to the department in downline
																downline[person.division][person.department]
																	.push(person);
																// add this user to lookupsToBeProcessed, 
																// 		so that we'll also look up 
																// 		reportees for this user
																lookupsToBeProcessed.push(person.account);
															}
														});
														// whether or not any reportees were 
														// 		found, signify that we performed 
														// 		the lookup for this manager
														lookupsProcessed.push(lookupToProcess);
													}
												});
											}
											// alphabetize the downline arrays:
											// iterate over the division keys
											Object.keys(downline).forEach((downlineDivisionKey) => {
												// iterate over the department keys
												Object.keys(downline[downlineDivisionKey])
													.forEach((downlineDepartmentKey) => {
														// alphabetize array
														downline[downlineDivisionKey][downlineDepartmentKey]
															.sort(module.exports.ReturnPersonNameWeightRelativeToAnother);
													});
											});
											// add downline to this manager
											manager.downline = downline;
											// push this manager to the final data
											allManagers.push(manager);
										}
									});
							}
						});
					});
					// alphabetize the managers
					allManagers.sort(module.exports.ReturnPersonNameWeightRelativeToAnother);
					// get a promise to delete all documents
					DataQueries.DeleteAllDocsFromCollection('peopleManagersWithHierarchicalDownlines')
						// if the promise is resolved with the result
						.then((deletionResult) => {
							// get a promise to insert allPeople
							DataQueries.InsertDocIntoCollection(
								allManagers,
								'peopleManagersWithHierarchicalDownlines',
							)
								// if the promise is resolved with the result
								.then((insertResult) => {
									// resolve this promise with the result
									resolve(insertResult);
								})
								// if the promise is rejected with an error
								.catch((insertError) => {
									// reject this promise with an error
									reject(insertError);
								});
						})
						// if the promise is rejected with an error
						.catch((deletionError) => {
							// reject this promise with an error
							reject(deletionError);
						});
				})
				// if the promise to get all ad users from csv was rejected with an error
				.catch((queryError) => {
					// reject this promise with the error
					reject(queryError);
				});
		}),

	// ----- DATA PULLS

	/**
	 * @name ReturnAllPeople
	 * @function
	 * @async
	 * @description Return all people from 'peopleFlat' collection.
	 */

	ReturnAllPeople: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all documents
			DataQueries.ReturnAllDocsFromCollection('peopleFlat')
				// if the promise is resolved with the docs
				.then((result) => {
					// resolve this promise with the docs
					resolve(result);
				})
				// if the promise is rejected with an error
				.catch((error) => {
					// reject this promise with an error
					reject(error);
				});
		}),

	/**
	 * @name ReturnOnePerson
	 * @function
	 * @async
	 * @description Return one person from 'peopleFlat' collection.
	 * @param {string} account - E.g., 'sp1'
	 */

	ReturnOnePerson: (account) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all documents
			DataQueries.ReturnOneSpecifiedDocFromCollection('peopleFlat', {
				$and: [{
					account,
				}],
			}, {})
				// if the promise is resolved with the docs
				.then((result) => {
					// resolve this promise with the docs
					resolve(result);
				})
				// if the promise is rejected with an error
				.catch((error) => {
					// reject this promise with an error
					reject(error);
				});
		}),
	
	ReturnAllPeopleByDivisionDepartment: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve the doc
			DataQueries.ReturnAllDocsFromCollection('peopleByDivisionsDepartments')
				// if the promise is resolved with the doc
				.then((result) => {
					// extract the data set
					const dataSet = result.docs[0];
					// delete the Mongo ID from the data set
					delete dataSet._id;
					// resolve this promise with the data set
					resolve(dataSet);
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		}),
	ReturnAllPeopleInDepartment: (deptartmentName) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all documents from the peopleFlat document collection
			DataQueries.ReturnAllSpecifiedDocsFromCollection('peopleFlat', {
				department: deptartmentName,
			}, {})
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => {
					resolve(result);
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		}),
	ReturnAllPeopleInDivision: (divisionName) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all documents from the peopleFlat document collection
			DataQueries.ReturnAllSpecifiedDocsFromCollection('peopleFlat', {
				division: divisionName,
			}, {})
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => {
					resolve(result);
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		}),
	ReturnAllDepartments: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all documents from the adUsers document collection
			DataQueries.ReturnAllDocsFromCollection('peopleDepartments')
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => {
					resolve(result);
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		}),
	ReturnAllManagersFlat: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all documents from the peopleFlat document collection
			DataQueries.ReturnAllSpecifiedDocsFromCollection('peopleFlat', {
				roles: 'manager',
			}, {})
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => {
					resolve(result);
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		}),
	ReturnDirectReportsForOneManager: (managerAccount) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all documents from the adUsers document collection
			DataQueries.ReturnAllSpecifiedDocsFromCollection('peopleFlat', {
				manager: managerAccount,
			}, {})
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => {
					resolve(result);
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		}),
	ReturnAllManagersWithFlatDownline: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all documents from the 
			// 		peopleManagersWithFlatDownlines document collection
			DataQueries.ReturnAllDocsFromCollection('peopleManagersWithFlatDownlines')
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => { resolve(result); })
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => { reject(error); });
		}),
	ReturnAllManagersWithHierarchicalDownline: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all documents from the 
			// 		adManagersWithFullFlatDownlines document collection
			DataQueries.ReturnAllDocsFromCollection('peopleManagersWithHierarchicalDownlines')
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => { resolve(result); })
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => { reject(error); });
		}),
	ReturnOneManagerWithFlatDownline: (managerAccount) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all documents from the adUsers document collection
			DataQueries.ReturnAllSpecifiedDocsFromCollection('peopleManagersWithFlatDownlines', {
				account: managerAccount,
			}, {})
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => {
					resolve(result);
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		}),
	ReturnOneManagerWithWithHierarchicalDownline: (managerAccount) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all documents from the adUsers document collection
			DataQueries.ReturnAllSpecifiedDocsFromCollection('peopleManagersWithHierarchicalDownlines', {
				account: managerAccount,
			}, {})
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => {
					resolve(result);
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		}),
	ReturnFullFlatUplineForOneUser: (account) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to get the user's manager, her manger, and so on, using a graph lookup
			DataConnection.get('peopleFlat')
				.aggregate([
					{ $match: { account } },
					{
						$graphLookup: {
							from: 'peopleFlat',
							startWith: '$manager',
							connectFromField: 'manager',
							connectToField: 'account',
							as: 'upline',
						},
					},
				])
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => {
					resolve(result[0].upline);
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		}),

	// --- UTILITIES, ANALYSIS

	ReturnPersonIsManager: (personUltiProID, personAccount, allEmployees, edgeCaseManagers) => {
		// set up a flag indicating that this person is not a manager
		let thisPersonIsManager = false;
		// iterate over employees
		allEmployees.forEach((employee) => {
			// if this employee's account matched person account
			if (employee.upSupervisorId === personUltiProID) {
				// alter manager flag
				thisPersonIsManager = true;
			}
		});
		// if we still haven't determined that this person is a manager
		if (!thisPersonIsManager) {
			// iterate over edge case managers
			edgeCaseManagers.forEach((edgeCaseManager) => {
				// if this edge case manager's account matches person account
				if (edgeCaseManager.account === personAccount) {
					// alter manager flag
					thisPersonIsManager = true;
				}
			});
		}
		// return manager flag
		return thisPersonIsManager;
	},
	/**
	 * @name ReturnPersonNameWeightRelativeToAnother
	 * @function
	 * @description Used in alphabetizing sets of people by last name.
	 */

	ReturnPersonNameWeightRelativeToAnother: (a, b) => {
		if (a.lastName < b.lastName) {
			return -1;
		}
		if (a.lastName > b.lastName) {
			return 1;
		}
		if (a.firstName < b.firstName) {
			return -1;
		}
		if (a.firstName > b.firstName) {
			return 1;
		}
		return 0;
	},

	ReturnDivisionOrDepartmentNameWeightRelativeToAnother: (a, b, propertName) => {
		if (a.name < b.name) {
			return -1;
		}
		if (a.name > b.name) {
			return 1;
		}
		return 0;
	},

};
