/**
 * @name Response
 * @service
 * @description Handles responses to requests and cron initiations.
 */

const Log = require('log');
// const Twitter = require('twitter');
// const moment = require('moment');

module.exports = {

	/**
	 * @name HandleResponse
	 * @function
	 * @async
	 * @description Given data and response function, log request, 
	 * use function to respond to request, and, as needed, 
	 * process error.
	 * @param {...Response} incomingResponse - {@link Response} object
	 */

	HandleResponse: ({
		processError,
		emergencyError,
		statusCode,
		responder,
		content,
	}) => {
		// set up vars
		let returnValue;
		const logValue = content;
		// if there's a status code
		if (statusCode) {
			// add status code to log value
			logValue.statusCode = statusCode;
			// set returnValue to a Lambda function HTTP response
			returnValue = {
				statusCode,
				headers: {
					'Access-Control-Allow-Origin': '*',
				},
				body: JSON.stringify(content),
			};
		// if there's no status code
		} else {
			// set returnValue to content
			returnValue = content;
		}
		// log content
		Log.Log(logValue);
		// respond with return value, using responder function
		responder(returnValue);
	},

	/**
	 * @name AddErrorToTwitter
	 * @function
	 * @async
	 * @description Given error data, construct Tweet and send it to Twitter.
	 */

	/* AddErrorToTwitter: (errorData) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// try to post error to twitter
			try {
				// construct tweet based on errorData
				// start with datetime
				let errorTweet = `${moment().format('ddd, MM/DD, h:mm a')} - `;
				// add emergency or standard flag
				if (errorData.emergencyError) {
					errorTweet += 'Emergency Error: ';
				} else {
					errorTweet += 'Standard Error.';
				}
				// if there's a status message, add it
				if (errorData.emergencyErrorDetails) {
					errorTweet += `${errorData.emergencyErrorDetails}.`;
					// if there's no status message but there are 
					// 		emergency error details, add them
				} else if (errorData.emergencyErrorDetails) {
					errorTweet += `${errorData.emergencyErrorDetails}.`;
					// if neither are available, add indication thereof
				} else {
					errorTweet += 'No details available.';
				}
				// get a twitter client
				const twitterClient = new Twitter({
					consumer_key: process.env.hubHelpTwitterConsumerKey,
					consumer_secret: process.env.hubHelpTwitterConsumerSecret,
					access_token_key: process.env.hubHelpTwitterAccessTokenKey,
					access_token_secret: process.env.hubHelpTwitterAccessTokenSecret,
				});
				// attempt post error to Twitter
				twitterClient.post('statuses/update', {
					status: errorTweet,
				}, (tweetingError, tweet, response) => {
					// if there was an error posting to twitter
					if (tweetingError) {
						// construct custom error object
						const twitterErrorData = {
							error: true,
							twitterError: true,
							twitterErrorDetails: tweetingError,
						};
						// resolve the promise with the error data
						resolve(twitterErrorData);
					} else {
						resolve({
							error: false,
							twitterError: false,
						});
					}
				});
			} catch (tweetingError) {
				// construct custom error object
				const twitterErrorData = {
					error: true,
					twitterError: true,
					twitterErrorDetails: tweetingError,
				};
				// resolve the promise with the error data
				resolve(twitterErrorData);
			}
		}), */

	/**
	 * @name ProcessError
	 * @function
	 * @async
	 * @description Given error data, send data to AddErrorToTwitter(). 
	 * (This is separate from AddErrorToTwitter() because we may want to 
	 * process errors in different or additional ways in the future.)
	 */

	/* ProcessError: (errorData) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to add error to Twitter
			module.exports.AddErrorToTwitter(errorData)
				// if the promise is resolved with the result
				.then((result) => {
					// resolve this promise with the result
					resolve(result);
				})
				// if the promise is rejected with an error
				.catch((error) => {
					// reject this promise with an error
					reject(error);
				});
		}),
 */
};
