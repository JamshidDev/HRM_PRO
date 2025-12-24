import axios from "@/service/index.js";

const _get_report_export = async () => {
  return await axios.get(`/v1/structure/report-export`);
};

const _post_report_export = async (payload) => {
  return await axios.post(`/v1/structure/report-export`, payload);
};


export default {
  _get_report_export,
  _post_report_export
};
