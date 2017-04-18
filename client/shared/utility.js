// Handles an error message
const handleError = (message) => {
  console.log(message);

  const errContainer = $('#alert-container');
  if (errContainer) {
    errContainer.css('display', 'block');
    errContainer.css('visibility', 'visible');
  }

  const err = $('#error-message');
  if (err) {
    err.text(message);
  }
};

// Defines a response
class Response {
  constructor(xhr, userdata) {
    try {
      this.data = JSON.parse(xhr.responseText);
    } catch (ex) {
      if (xhr.responseText) {
        handleError(xhr.responseText);
      }
      this.data = null;
    }

    this.status = xhr.status;
    this.userdata = userdata;
  }
}

// Sends a request
const sendRequest = (method, url, data, callback, userdata) => {
  $.ajax({
    cache: false,
    type: method.toUpperCase(),
    url,
    data,
    dataType: 'json',
    success: (responseData, status, xhr) => {
      const response = new Response(xhr);
      callback(response);
    },
    error: (xhr, status, error) => {
      try {
        const message = JSON.parse(xhr.responseText);
        handleError(message.error);
      } catch (ex) {
        handleError(xhr.responseText);
      }
    },
  });
};

// Gets a CSRF token
const getCsrfToken = (callback) => {
  sendRequest('GET', '/get-csrf-token', null, (response) => {
    const token = response.data.token;
    callback(token);
  });
};

// Checks to see if the given username is valid
const isUsernameValid = (name) => {
  const regex = /^[a-zA-Z0-9_\-]+$/;
  return regex.matches(name) && name.length >= 4 && name.length <= 16;
}
