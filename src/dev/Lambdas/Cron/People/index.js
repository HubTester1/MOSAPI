/**
 * @name People
 * @cron
 * @description Perform all cron jobs to retrieve and process data for People API
 */

const DataQueries = require('data-queries');
const UltiPro = require('ultipro');
const MSGraph = require('ms-graph');
const Utilities = require('utilities');
const axios = require('axios');
// peopleRawTempEdgeCaseManagers

module.exports = {

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
			DataQueries.ReturnAllDocsFromCollection('peopleSettings')
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

	/**
	 * @name ReturnUserNameWeightRelativeToAnother
	 * @function
	 * @description Used in alphabetizing sets of people by last name.
	 */

	ReturnUserNameWeightRelativeToAnother: (a, b) => {
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

	// ----- DATA PROCESSING

	/**
	 * @name AddAllUltiProActiveEmployeesToDatabase
	 * @function
	 * @async
	 * @description Get all active employees via UltiPro service. 
	 * Insert into 'peopleRawUltiProActiveEmployees' collection.
	 */

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
					DataQueries.InsertDocIntoCollection(allNesoEmployees, 'peopleRawTempNesoAD')
						// if the promise is resolved with the result, then resolve this promise with the result
						.then((insertResult) => {
							resolve({
								// statusCode: 200,
								// body: JSON.stringify(insertResult),
							});
						})
						// if the promise is rejected with an error, then reject this promise with an error
						.catch((insertError) => {
							reject({
								statusCode: 500,
								body: JSON.stringify(insertError),
							});
						});
				})
				// if the promise is rejected with an error
				.catch((nesoError) => {
					// reject this promise with the error
					reject(nesoError);
				});
		}),
	
	AddAllUltiProActiveEmployeesToDatabase: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			UltiPro.ReturnAllEmployeesFromUltiPro()
				// if the promise is resolved with the result, then resolve this promise with the result
				.then((queryResult) => {
					const allActiveEmployees = [];
					queryResult.allEmployees.forEach((employee) => {
						if (employee.isActive) {
							let phoneToUse = '';
							if (
								employee.workPhone &&
								employee.workPhone.replace(/ /g, '')
							) {
								phoneToUse =
									`${employee.workPhone.slice(0, 3)}-${employee.workPhone.slice(3, 6)}-${employee.workPhone.trim().slice(6)}`;
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
								jobTitle: employee.alternateJobTitle ? 
									Utilities.ReturnSubstringPrecedingNewLineCharacters(employee.alternateJobTitle) :
									Utilities.ReturnSubstringPrecedingNewLineCharacters(employee.jobTitle),
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
					DataQueries.InsertDocIntoCollection(allActiveEmployees, 'peopleRawUltiProActiveEmployees')
						// if the promise is resolved with the result, then resolve this promise with the result
						.then((insertResult) => {
							resolve({
								statusCode: 200,
								body: JSON.stringify(insertResult),
							});
						})
						// if the promise is rejected with an error, then reject this promise with an error
						.catch((error) => {
							reject({
								statusCode: 500,
								body: JSON.stringify(error),
							});
						});
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject({
						statusCode: 500,
						body: JSON.stringify(error),
					});
				});
		}),

	/**
	 * @name AddTrackedMSGraphGroupsToDatabase
	 * @function
	 * @async
	 * @description Find out from people settings which AD groups 
	 * we're tracking and then get those group's info via Graph.
	 * Insert into 'peopleRawMSGraphGroups' collection.
	 */

	AddTrackedMSGraphGroupsToDatabase: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// set up var to contain all tracked groups with their members
			const allTrackedGroupsWithMembers = [];
			// set up group membership query promises container
			const allGroupMembershipQueryPromises = [];
			// get a promise to get IDs for all of the groups we're tracking
			DataQueries.ReturnAllDocsFromCollection('peopleSettings')
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
								'peopleRawMSGraphGroups',
							)
								// if the promise is resolved with the result
								.then((insertResult) => {
									// resolve this promise with the result
									resolve({
										statusCode: 200,
										body: JSON.stringify(insertResult),
									});
								})
								// if the promise is rejected with an error, then reject this promise with an error
								.catch((insertError) => {
									reject({
										statusCode: 500,
										body: JSON.stringify(insertError),
									});
								});
						});
				})
				// if the promise is rejected with an error
				.catch((error) => {
					// reject this promise with an error
					reject({
						statusCode: 500,
						body: JSON.stringify(error),
					});
				});
		}),

	/**
	 * @name AddHubComponentGroupAdminsToDatabase
	 * @function
	 * @async
	 * @description Get The Hub's Component Group Admins from SPO via Graph.
	 * Insert into 'peopleRawMSGraphHubComponentGroupAdmins' collection.
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
					DataQueries.InsertDocIntoCollection(groupsAndAdmins, 'peopleRawMSGraphHubComponentGroupAdmins')
						// if the promise is resolved with the result
						.then((insertResult) => {
							// resolve this promise with the result
							resolve({
								statusCode: 200,
								body: JSON.stringify(insertResult),
							});
						})
						// if the promise is rejected with an error
						.catch((insertError) => {
							// reject this promise with an error
							reject({
								statusCode: 500,
								body: JSON.stringify(insertError),
							});
						});
				})
				// if the promise is rejected with an error
				.catch((error) => {
					// reject this promise with an error
					reject({
						statusCode: 500,
						body: JSON.stringify(error),
					});
				});
		}),

	/**
	 * @name SyncSpecifiedRawData
	 * @function
	 * @async
	 * @description Sync (delete, fetch, insert) a specific set of raw data.
	 * @param {string} dataSetToken - e.g., 'ultiProActiveEmployees', 'graphGroups', 'hubAdmins'
	 */

	SyncSpecifiedRawData: (dataSetToken) =>
		// return a new promise
		new Promise((resolve, reject) => {
			let collectionName = '';
			switch (dataSetToken) {
			case 'nesoPeople':
				collectionName = 'peopleRawTempNesoAD';
				break;
			case 'ultiProActiveEmployees':
				collectionName = 'peopleRawUltiProActiveEmployees';
				break;
			case 'graphGroups':
				collectionName = 'peopleRawMSGraphGroups';
				break;
			case 'hubAdmins':
				collectionName = 'peopleRawMSGraphHubComponentGroupAdmins';
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
							reject({
								statusCode: 500,
								body: JSON.stringify(insertionError),
							});
						});
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((deletionError) => {
					reject({
						statusCode: 500,
						body: JSON.stringify(deletionError),
					});
				});
		}),

	/**
	 * @name SyncAllRawData
	 * @function
	 * @async
	 * @description Sync (delete, fetch, insert) all raw data sets.
	 */

	SyncAllRawData: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get promises to sync specific raw data sets
			Promise.all([
				module.exports.SyncSpecifiedRawData('peopleRawTempNesoAD'),
				module.exports.SyncSpecifiedRawData('ultiProActiveEmployees'),
				module.exports.SyncSpecifiedRawData('graphGroups'),
				module.exports.SyncSpecifiedRawData('hubAdmins'),
			])
				// if all of those promises were resolved
				.then((syncResults) => {
					// resolve this promise
					resolve({
						statusCode: 200,
						body: JSON.stringify(syncResults),
					});
				})
				// if any one promise is rejected with an error
				.catch((syncError) => {
					// reject this promise with that error
					reject({
						statusCode: 500,
						body: JSON.stringify(syncError),
					});
				});
		}),

	/**
	 * @name ProcessAllPeopleFlat
	 * @function
	 * @async
	 * @description Construct flat set of individual people. 
	 * Insert into 'peopleFlat' collection. This is the base people data set.
	 */

	ReturnPersonIsManager: (personAccount, allEmployees, edgeCaseManagers) => {
		// set up a flag indicating that this person is not a manager
		let thisPersonIsManager = false;
		// iterate over employees
		allEmployees.forEach((employee) => {
			// if this employee's account matched person account
			if (employee.account === personAccount) {
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

	ProcessAllDivisions: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get promises to get all of the relevant raw data
			Promise.all([
				DataQueries.ReturnAllDocsFromCollection('peopleRawUltiProActiveEmployees'),
				DataQueries.ReturnAllDocsFromCollection('peopleRawTempNesoAD'),
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
										console.log(employee.account);
										// add this employee's division code to the array
										// 		of those that have been handled
										divisionsHandled.push(employee.orgLevel1Code);
										// add this employee's division code and division name
										// 		to the array of all divisions
										allDivisions.push({
											orgLevel1Code: employee.orgLevel1Code,
											name: nesoPerson.division,
											nameWithCode: `${employee.orgLevel1Code} - ${nesoPerson.division}`,
										});
									}
								});
							}
						}
					});
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
									resolve({
										statusCode: 200,
										// body: JSON.stringify(insertResult),
									});
								})
								// if the promise is rejected with an error
								.catch((insertError) => {
									// reject this promise with an error
									reject({
										statusCode: 500,
										body: JSON.stringify(insertError),
									});
								});
						})
						// if the promise is rejected with an error
						.catch((deletionError) => {
							// reject this promise with an error
							reject({
								statusCode: 500,
								body: JSON.stringify(deletionError),
							});
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
				DataQueries.ReturnAllDocsFromCollection('peopleRawUltiProActiveEmployees'),
				DataQueries.ReturnAllDocsFromCollection('peopleRawTempNesoAD'),
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
											name: nesoPerson.department,
											nameWithCode: `${employee.orgLevel2Code} - ${nesoPerson.department}`,
										});
									}
								});
							}
						}
					});
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
									resolve({
										statusCode: 200,
										// body: JSON.stringify(insertResult),
									});
								})
								// if the promise is rejected with an error
								.catch((insertError) => {
									// reject this promise with an error
									reject({
										statusCode: 500,
										body: JSON.stringify(insertError),
									});
								});
						})
						// if the promise is rejected with an error
						.catch((deletionError) => {
							// reject this promise with an error
							reject({
								statusCode: 500,
								body: JSON.stringify(deletionError),
							});
						});
				})
				// if the promise is rejected with an error
				.catch((returnDataError) => {
					// reject this promise with the error
					reject(returnDataError);
				});
		}),

	
	ProcessPeopleFlat: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve setting indicating whether 
			// 		people processing is permitted or not
			module.exports.ReturnPeopleProcessingPermitted()
				// if the promise was resolved
				.then((permittedResults) => {
					// if it's ok to process people
					if (permittedResults.dataProcessingPermitted) {
						// get a promise to sync all raw data
						module.exports.SyncAllRawData()
							// if the promise was resolved
							.then((rawSyncResults) => {
								// get promises to get all of the relevant raw data
								Promise.all([
									DataQueries.ReturnAllDocsFromCollection('peopleSettings'),
									DataQueries.ReturnAllDocsFromCollection('peopleRawMOSPreferences'),
									DataQueries.ReturnAllDocsFromCollection('peopleRawMSGraphGroups'),
									DataQueries.ReturnAllDocsFromCollection('peopleRawMSGraphHubComponentGroupAdmins'),
									DataQueries.ReturnAllDocsFromCollection('peopleRawUltiProActiveEmployees'),
									DataQueries.ReturnAllDocsFromCollection('peopleRawTempNesoAD'),
									DataQueries.ReturnAllDocsFromCollection('peopleRawTempEdgeCaseManagers'),
								])
									// if the promise is resolved
									.then((queryResults) => {
										// extract results for convenience
										const groupSettings = queryResults[0].docs[0].groupsTracked;
										const preferences = queryResults[1].docs;
										const groups = queryResults[2].docs;
										const componentGroupAdmins = queryResults[3].docs;
										const employees = queryResults[4].docs;
										const nesoPeople = queryResults[5].docs;
										const edgeCaseManagers = queryResults[6].docs;
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
													employee.account,
													employees,
													edgeCaseManagers,
												);
											/* // get this employee's division and department
											const thisEmployeeDivisionAndDepartment = 
												module.exports.ReturnPersonsDivisionAndDepartment(
													employee.account,
													nesoPeople,
												); */

											// construct this person from the ultipro employee data;
											// 		some of these properties are named for backward compatibility
											const thisEmployee = {
												account: employee.account,
												employeeID: employee.mosEmployeeID,
												firstName: employee.firstName,
												lastName: employee.lastName,
												preferredName: employee.preferredName,
												firstInitial: employee.preferredName ? employee.preferredName.slice(0, 1).toUpperCase() : employee.firstName.slice(0, 1).toUpperCase(),
												lastInitial: employee.lastName.slice(0, 1).toUpperCase(),
												displayName: employee.preferredName ? `${employee.preferredName} ${employee.lastName}` : `${employee.firstName} ${employee.lastName}`,
												title: employee.jobTitle,
												email: employee.email,
												officePhone: employee.phone,
												manager: thisEmpoyeeManager,
												// department: employee.orgLevel2Code,
												// division: employee.orgLevel1Code,
												// orgLevel1Code: employee.orgLevel1Code,
												// orgLevel2Code: employee.orgLevel2Code,
												// orgLevel3Code: employee.orgLevel3Code,
												// orgLevel4Code: employee.orgLevel4Code,
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
														resolve({
															statusCode: 200,
															// body: JSON.stringify(insertResult),
														});
													})
													// if the promise is rejected with an error
													.catch((insertError) => {
														// reject this promise with an error
														reject({
															statusCode: 500,
															body: JSON.stringify(insertError),
														});
													});
											})
											// if the promise is rejected with an error
											.catch((deletionError) => {
												// reject this promise with an error
												reject({
													statusCode: 500,
													body: JSON.stringify(deletionError),
												});
											});
									})
									// if the promise is rejected with an error
									.catch((returnDataError) => {
										// reject this promise with an error
										reject({
											statusCode: 500,
											body: JSON.stringify(returnDataError),
										});
									});
							})
							// if the promise is rejected with an error
							.catch((syncError) => {
								// reject this promise with the error
								reject(syncError);
							});
					// if it's NOT ok to process people
					} else {
						// reject this promise with the error
						reject({
							error: true,
							permittedError: 'dataProcessingPermitted === false',
						});
					}
				})
				// if the promise is rejected with an error
				.catch((permittedError) => {
					// reject this promise with the error
					reject({
						error: true,
						permittedError: 'dataProcessingPermitted === false',
					});
				});
		}),

	ProcessPeopleByDivisionsDepartments: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve setting indicating whether 
			// 		people processing is permitted or not
			module.exports.ReturnPeopleProcessingPermitted()
				// if the promise was resolved
				.then((permittedResults) => {
					if (permittedResults.dataProcessingPermitted) {
						// get a promise to 
						module.exports.ReturnPeopleByDivisionsDepartmentsFromPeopleFlat()
							// if the promise is resolved with a result
							.then((returnResults) => {
								// get a promise to delete all documents
								DataQueries.DeleteAllDocsFromCollection('peopleByDivisionsDepartments')
									// if the promise is resolved with the result
									.then((deletionResult) => {
										// get a promise to insert allPeople
										DataQueries.InsertDocIntoCollection(
											returnResults.peopleByDivisionsDepartments,
											'peopleByDivisionsDepartments',
										)
											// if the promise is resolved with the result
											.then((insertResult) => {
												// resolve this promise with the result
												resolve({
													statusCode: 200,
													// body: JSON.stringify(insertResult),
												});
											})
											// if the promise is rejected with an error
											.catch((insertError) => {
												// reject this promise with an error
												reject({
													statusCode: 500,
													body: JSON.stringify(insertError),
												});
											});
									})
									// if the promise is rejected with an error
									.catch((deletionError) => {
										// reject this promise with an error
										reject({
											statusCode: 500,
											body: JSON.stringify(deletionError),
										});
									});
							})
							// if the promise is rejected with an error
							.catch((error) => {
								// reject this promise with the error
								reject(error);
							});
					} else {
						// reject this promise with the error
						reject({
							error: true,
							permittedError: 'dataProcessingPermitted === false',
						});
					}
				})
				// if the promise is rejected with an error
				.catch((permittedError) => {
					// reject this promise with the error
					reject({
						error: true,
						permittedError: 'dataProcessingPermitted === false',
					});
				});
		}),

	/* ProcessPeopleByDivisionsDepartments: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve setting indicating whether 
			// 		people processing is permitted or not
			module.exports.ReturnPeopleProcessingPermitted()
				// if the promise was resolved
				.then((permittedResults) => {
					if (permittedResults.dataProcessingPermitted) {
					} else {
						// reject this promise with the error
						reject({
							error: true,
							permittedError: 'dataProcessingPermitted === false',
						});
					}
				})
				// if the promise is rejected with an error
				.catch((permittedError) => {
					// reject this promise with the error
					reject({
						error: true,
						permittedError: 'dataProcessingPermitted === false',
					});
				});
		}), */

	ReturnPeopleByDivisionsDepartmentsFromPeopleFlat: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all docs
			DataQueries.ReturnAllDocsFromCollection('peopleFlat')
				// if the promise is resolved with the docs
				.then((peopleFlatResult) => {
					// extract the data from the result
					const peopleFlat = peopleFlatResult.docs;
					// set up empty object to receive the new data
					const peopleByDivisionsDepartments = {};
					// iterate over peopleFlat
					peopleFlat.forEach((person, personIndex) => {
						// if this user has a division and department
						if (person.division && person.division !== '' &&
							person.department && person.department !== '') {
							// get copies of the division and department names without 
							// 		characters that are illegal as MongoDB key names
							const personDivision = Utilities.ReplaceAll('\\.', '', person.division);
							// console.log(personDivision);
							const personDepartment = Utilities.ReplaceAll('\\.', '', person.department);
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
							if (person.manager) {
								// set up flag indicating that manager is not already added
								let thisManagerAlreadyAdded = false;
								// iterate over managers already added
								peopleByDivisionsDepartments[personDivision][personDepartment].managers
									.forEach((manager, managerIndex) => {
										// if this already added manager is the user's manager
										if (manager === person.manager) {
											// set flag to indicate that this user's manager was already added
											thisManagerAlreadyAdded = true;
										}
									});
								// if this user's manager is not already added to peopleByDivisionsDepartments
								if (!thisManagerAlreadyAdded) {
									// add this user's manager's account to peopleByDivisionsDepartments
									peopleByDivisionsDepartments[personDivision][personDepartment]
										.managers.push(person.manager);
								}
							}
						}
					});
					// effectively, convert department managers from accounts to profiles
					// get an array of peopleByDivisionsDepartments's property keys
					const divisionKeys = Object.keys(peopleByDivisionsDepartments);
					// set up vars for tracking whether or not all divisions have been processed
					const divisionsQuantity = divisionKeys.length;
					let divisionsProcessedQuantity = 0;
					// iterate over the array of peopleByDivisionsDepartments's property keys
					divisionKeys.forEach((divisionKey) => {
						// increment the number of divisions processed
						divisionsProcessedQuantity += 1;
						// get an array of this division's property keys
						const departmentKeys = Object.keys(peopleByDivisionsDepartments[divisionKey]);
						// set up vars for tracking whether or not all departments have been processed
						const adDepartmentsQuantity = departmentKeys.length;
						let departmentsProcessedQuantity = 0;
						// iterate over the array of this division object's property keys; 
						// 		these are departments
						departmentKeys.forEach((departmentKey) => {
							// increment the number of departments processed
							departmentsProcessedQuantity += 1;
							// extract a copt of the managers array
							const thisDeptManagerAccounts =
								peopleByDivisionsDepartments[divisionKey][departmentKey].managers;
							// delete the managers array
							delete peopleByDivisionsDepartments[divisionKey][departmentKey].managers;
							// set up vars for tracking whether or not all departments have been processed
							const thisDeptManagerAccountsQuantity = thisDeptManagerAccounts.length;
							let thisDeptManagerAccountsProcessedQuantity = 0;
							// for each manager account
							thisDeptManagerAccounts.forEach((managerAccount) => {
								// get a promise to look up the corresponding user profile
								DataQueries.ReturnOneSpecifiedDocFromCollection(
									'peopleFlat',
									{ account: managerAccount },
									{},
								)
									// if the promise was resolved
									.then((managerAccountResult) => {
										// if this department doesn't already have a managers array
										if (!peopleByDivisionsDepartments[divisionKey][departmentKey].managers) {
											// create a new, empty managers array
											peopleByDivisionsDepartments[divisionKey][departmentKey].managers = [];
										}
										// add the returned user profile to the new manager array
										peopleByDivisionsDepartments[divisionKey][departmentKey]
											.managers.push(managerAccountResult.docs);
										// increment the number of this department's manager accounts
										// 		that have been processed
										thisDeptManagerAccountsProcessedQuantity += 1;
										// if we're through processing all manager for all departments 
										// 		for all divisions
										if (
											(divisionsQuantity === divisionsProcessedQuantity) &&
											(adDepartmentsQuantity === departmentsProcessedQuantity) &&
											(thisDeptManagerAccountsQuantity === thisDeptManagerAccountsProcessedQuantity)
										) {
											// resolve this promise with a message and the data
											resolve({
												error: false,
												csvError: false,
												peopleByDivisionsDepartments,
											});
										}
									})
									// if the promise was rejects
									.catch((managerAccountError) => {
										// increment the number of this department's manager accounts
										// 		that have been processed
										thisDeptManagerAccountsProcessedQuantity += 1;
										// if we're through processing all manager for all departments 
										// 		for all divisions
										if (
											(divisionsQuantity === divisionsProcessedQuantity) &&
											(adDepartmentsQuantity === departmentsProcessedQuantity) &&
											(thisDeptManagerAccountsQuantity === thisDeptManagerAccountsProcessedQuantity)
										) {
											// resolve this promise with a message and the data
											resolve({
												error: false,
												csvError: false,
												peopleByDivisionsDepartments,
											});
										}
									});
							});
						});
					});
				})
				// if the promise is rejected with an error
				.catch((peopleFlatError) => {
					// reject this promise with an error
					reject(peopleFlatError);
				});
		}),

	ReturnDepartmentsFromPeopleByDivisionsDepartments: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all docs
			DataQueries.ReturnAllDocsFromCollection('peopleByDivisionsDepartments')
				// if the promise is resolved with the docs
				.then((divDeptResult) => {
					// resolve this promise with the docs
					resolve(divDeptResult);
				})
				// if the promise is rejected with an error
				.catch((divDeptError) => {
					// reject this promise with an error
					reject(divDeptError);
				});
		}),

	ReturnManagersFromPeopleFlat: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all docs
			DataQueries.ReturnAllDocsFromCollection('peopleFlat')
				// if the promise is resolved with the docs
				.then((peopleFlatResult) => {
					// resolve this promise with the docs
					resolve(peopleFlatResult);
				})
				// if the promise is rejected with an error
				.catch((peopleFlatError) => {
					// reject this promise with an error
					reject(peopleFlatError);
				});
		}),

	ReturnManagersWithFlatDownlinesFromDBQueries: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all docs
			Promise.all([
				module.exports.ReturnAllUsersByDivisionDepartment(),
				module.exports.ReturnAllPeople(),
			])
				// if the promise is resolved with the docs
				.then((queryResult) => {
					// resolve this promise with the docs
					resolve(queryResult);
				})
				// if the promise is rejected with an error
				.catch((queryError) => {
					// reject this promise with an error
					reject(queryError);
				});
		}),

	ReturnManagersWithHierarchicalDownlinesFromDBQueries: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all docs
			Promise.all([
				module.exports.ReturnAllUsersByDivisionDepartment(),
				module.exports.ReturnAllPeople(),
			])
				// if the promise is resolved with the docs
				.then((queryResult) => {
					// resolve this promise with the docs
					resolve(queryResult);
				})
				// if the promise is rejected with an error
				.catch((queryError) => {
					// reject this promise with an error
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
					resolve({
						status: 200,
						body: JSON.stringify(result),
					});
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
			DataQueries.ReturnOneSpecifiedDocFromCollection('peopleSettings', {
				$and: [{
					account,
				}],
			}, {})
				// if the promise is resolved with the docs
				.then((result) => {
					// resolve this promise with the docs
					resolve({
						status: 200,
						body: JSON.stringify(result),
					});
				})
				// if the promise is rejected with an error
				.catch((error) => {
					// reject this promise with an error
					reject(error);
				});
		}),

	/**
	 * @name XXXXXXXXXXXXX
	 * @function
	 * @async
	 * @description XXXXXXXXXXXXX
	 */

	/* module.exports.XXXXXXXXXXXXX: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all documents
			DataQueries.ReturnAllDocsFromCollection('peopleSettings')
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
		}); */
};
