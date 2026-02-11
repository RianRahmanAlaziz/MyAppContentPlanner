
import axios, {
    AxiosInstance,
    InternalAxiosRequestConfig,
} from "axios";

// Ambil base URL dari .env
const API_URL: string | undefined = process.env.NEXT_PUBLIC_API_URL;

// Buat instance axios
const axiosInstance: AxiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        Accept: "application/json",
    },
});

// Tambahkan Authorization header otomatis di setiap request
axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        if (typeof window !== "undefined") {
            const token =
                localStorage.getItem("token") || sessionStorage.getItem("token");

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error: unknown) => {
        return Promise.reject(error);
    }
);

// Standard error handling
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        const data = error?.response?.data;

        return Promise.reject({
            status,
            message: data?.message || "Request failed",
            payload: data,
        });
    }
);

export default axiosInstance;
