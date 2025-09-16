import type { AxiosInstance } from "axios";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_PLANNER_API_URL

export const plannerApi: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  method: 'POST',
  params: {
    'api-version': '1',
    sp: '/triggers/manual/run',
    sv: '1.0',
    sig: 'MTq94CC0GvbYIRLg-wB39YW0YwSKFxnKCC7kmdsQYik'
  },
  headers: {accept: '*/*', 'content-type': 'application/json'}
});