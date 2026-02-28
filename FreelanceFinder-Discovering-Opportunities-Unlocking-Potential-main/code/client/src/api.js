import axios from "axios";

const fetchChats = async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/chats");
    console.log(res.data);
  } catch (err) {
    console.log("Chat fetch error:", err.message);
  }
};