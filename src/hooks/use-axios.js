import { useEffect, useMemo, useState } from 'react';

import Axios from 'axios';

const { CancelToken } = Axios;

const useAxios = (axiosOptions) => {
  const [options] = useState(axiosOptions);

  const source = useMemo(() => CancelToken.source(), []);

  const axios = useMemo(() => {
    const instance = Axios.create({
      baseURL: process.env.REACT_APP_API_URL,
      cancelToken: source.token,
      ...options,
    });

    instance.interceptors.request.use((request) => {
      const token = localStorage.getItem('Authorization');
      if (token && !request.headers.Authorization) {
        request.headers.Authorization = token;
      }

      return request;
    });

    return instance;
  }, [source, options]);

  useEffect(() => () => {
    source.cancel('Operation canceled by unmounted component.');
  }, [source]);

  return axios;
};

export default useAxios;
