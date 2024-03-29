import axiosInstance from "src/helpers/axios";
import Swal from "sweetalert2";

export const createBlog = (data) => {
  return async (dispatch) => {
    try {
      const res = await axiosInstance.post("/upload-new-blog", data);
      if (res.status === 200) {
        Swal.fire("Success", "Successfully Uploaded", "success");
        return true;
      }
      Swal.fire({
        icon: "error",
        text: res.data.msg,
      });
      return false;
    } catch (e) {
      Swal.fire({
        icon: "error",
        text: e.response.data.msg,
      });
      return false;
    }
  };
};
export const getPersonalBlog = () => {
  return async (dispatch) => {
    try {
      const res = await axiosInstance.get("/get-personal-blog-content");
      if (res.status === 200) {
        return { result: true, blogs: res.data.blogs };
      }
      return { result: false };
    } catch (e) {
      return { result: false };
    }
  };
};
