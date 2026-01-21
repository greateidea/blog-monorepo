import axios from "axios";

const remote = axios.create();

// Add a response interceptor
remote.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
  }, function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    if (import.meta.env.DEV) {
      console.log('[remote error]: ', error)
    }
    // const errorCode = error.response.data?.code;
    // if (errorCode) {
    //     switch (error.response.data?.code) {
    //         case 'UNAUTHORIZED': 
    //             console.log('[UNAUTHORIZED]: ', error.response.data)
    //             window.location.href = `${window.location.origin}/signin`; 
    //             break;
    //         default: 
    //             console.log('[response]: ', error);
    //             break;
    //     }
    // }
    return Promise.reject(error);
  });

export default remote;



