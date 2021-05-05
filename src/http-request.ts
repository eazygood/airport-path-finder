import https from 'https';

interface HttpRequestOption {
	host: string;
	path: string;
	method: string;
	rejectUnauthorized?: boolean;
}

interface HttpRequestResponse<T> {
	code: number;
	data: string | T;
}

const httpRequest = async <T>(options: HttpRequestOption): Promise<HttpRequestResponse<T>> => {
	return new Promise((resolve, reject) => {
		const req = https.request(options, (res) => {
			res.setEncoding('utf8');

			let data = '';

			res.on('data', (chunk: string): void => {
				data += chunk;
			});

			res.on('end', (): void => {
				resolve({
					code: 200,
					data,
				})
			});

			res.on('error', (err): void => {
				reject(err);
			});
		})

		req.on('error', err => reject(err));

		req.end();
	});
}

export { httpRequest, HttpRequestResponse }