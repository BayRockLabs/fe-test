import { anchorOrigin } from "./constants";

export function formatError(error = {}, setError) {
  try {
    const { name, response, message = "" } = error;
    if (name === "AxiosError") {
      const { status, data = {} } = response;
      if (status >= 500) {
        return "Something went wrong, please try again!";
      }
      if (status >= 400) {
        if (status === 400 && typeof setError === "function") {
          Object.keys(data).forEach((key) => {
            setError(key, { message: data[key] });
          });
          return ''
        }
        return Object.values(data).join(", ");
      }
    }
    return message;
  } catch (err) {
    console.log(err);
  }
}

export function displayError(enqueueSnackbar, error, setError) {
  const message = formatError(error, setError);
  if (message) {
    enqueueSnackbar(message, { variant: "error" }, {anchorOrigin});
  }
}
