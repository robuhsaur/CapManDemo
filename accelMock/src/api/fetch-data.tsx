const urlBase = "http://localhost:8000";

const getData = async (url: string, id?: number) => {
  if (id) {
    return fetch(`${urlBase}/${url}/${id}`);
  } else {
    return fetch(`${urlBase}/${url}`);
  }
};

const postData = async (url: string, data: any) => {
  console.log(data);
  return fetch(`${urlBase}/${url}`, {
    method: "post",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

const postDataJSON = async (url: string, data: any) => {
  console.log(data);
  return fetch(`${urlBase}/${url}`, {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

const putData = async (url: string, data: any) => {
  console.log(data);
  return fetch(`${urlBase}/${url}/${data.id}/`, {
    method: "PUT",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

const deleteData = async (url: string, data: any) => {
  console.log(data);
  return fetch(`${urlBase}/${url}/${data.id}/`, {
    method: "DELETE",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export default {
  getData,
  postData,
  putData,
  postDataJSON,
  deleteData,
};
