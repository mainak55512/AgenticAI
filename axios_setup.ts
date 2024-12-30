import axios from "axios";
import { TELEGRAM_API_KEY } from "./api_keys";

const BASE_URL = `https://api.telegram.org/bot${TELEGRAM_API_KEY}`;

function getAxiosInstance() {
	return {
		get(method, params) {
			return axios.get(`/${method}`, {
				baseURL: BASE_URL,
				params,
			});
		},
		post(method, data) {
			return axios({
				method: "post",
				baseURL: BASE_URL,
				url: `/${method}`,
				data,
			});
		}
	}
}

export { getAxiosInstance as axInstance }
