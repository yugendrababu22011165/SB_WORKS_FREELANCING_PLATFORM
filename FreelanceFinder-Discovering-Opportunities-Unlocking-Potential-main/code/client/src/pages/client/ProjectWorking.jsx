import React, { useContext, useEffect, useState, useCallback } from "react";
import "../../styles/client/ProjectWorking.css";
import { useParams } from "react-router-dom";
import axios from "axios";
import { GeneralContext } from "../../context/GeneralContext";

const ProjectWorking = () => {
  const { socket } = useContext(GeneralContext);
  const params = useParams();

  const [project, setProject] = useState(null);
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState(null);

  /* ================= FETCH PROJECT ================= */

  const fetchProject = useCallback(async (id) => {
    try {
      const response = await axios.get(
        `http://localhost:6001/fetch-project/${id}`
      );
      setProject(response.data);
    } catch (err) {
      console.log("Project fetch error:", err);
    }
  }, []);

  /* ================= JOIN SOCKET ROOM ================= */

  const joinSocketRoom = useCallback(() => {
    if (!socket || !params.id) return;

    socket.emit("join-chat-room", {
      projectId: params.id,
      freelancerId: "",
    });
  }, [socket, params.id]);

  /* ================= FETCH CHATS (FIXED) ================= */

  const fetchChats = useCallback(async () => {
    if (!params.id) return;

    try {
      const response = await axios.get(
        `http://localhost:6001/fetch-chats/${params.id}`
      );
      setChats(response.data);
    } catch (err) {
      console.log("API error:", err.response?.data || err.message);
    }
  }, [params.id]);

  /* ================= PAGE LOAD ================= */

  useEffect(() => {
    if (!params.id) return;

    fetchProject(params.id);
    fetchChats();
    joinSocketRoom();
  }, [params.id, fetchProject, fetchChats, joinSocketRoom]);

  /* ================= SOCKET LISTENER ================= */

  useEffect(() => {
    if (!socket) return;

    socket.on("message-from-user", fetchChats);

    return () => socket.off("message-from-user", fetchChats);
  }, [socket, fetchChats]);

  /* ================= SEND MESSAGE ================= */

  const handleMessageSend = () => {
    if (!message.trim() || !socket) return;

    socket.emit("new-message", {
      projectId: params.id,
      senderId: localStorage.getItem("userId"),
      message,
      time: new Date(),
    });

    setMessage("");
  };

  /* ================= APPROVE ================= */

  const handleApproveSubmission = async () => {
    try {
      await axios.get(
        `http://localhost:6001/approve-submission/${params.id}`
      );
      fetchProject(params.id);
      alert("Submission approved!!");
    } catch (err) {
      console.log(err);
    }
  };

  /* ================= REJECT ================= */

  const handleRejectSubmission = async () => {
    try {
      await axios.get(
        `http://localhost:6001/reject-submission/${params.id}`
      );
      fetchProject(params.id);
      alert("Submission rejected!!");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      {project && (
        <div className="project-data-page">
          <div className="project-data-container">
            <div className="project-data">
              <h3>{project.title}</h3>
              <p>{project.description}</p>

              <span>
                <h5>Required skills</h5>
                <div className="required-skills">
                  {project.skills?.map((skill) => (
                    <p key={skill}>{skill}</p>
                  ))}
                </div>
              </span>

              <span>
                <h5>Budget</h5>
                <h6>₹ {project.budget}</h6>
              </span>
            </div>

            {project.freelancerId && (
              <div className="project-submissions-container">
                <h4>Submission</h4>

                <div className="project-submissions">
                  {project.submission ? (
                    <div className="project-submission">
                      <span>
                        <h5>Project Link:</h5>
                        <a href={project.projectLink} target="_blank" rel="noreferrer">
                          {project.projectLink}
                        </a>
                      </span>

                      <span>
                        <h5>Manual Link:</h5>
                        <a href={project.manualLink} target="_blank" rel="noreferrer">
                          {project.manualLink}
                        </a>
                      </span>

                      <h5>Description for work</h5>
                      <p>{project.submissionDescription}</p>

                      {project.submissionAccepted ? (
                        <h5 style={{ color: "green" }}>Project completed!!</h5>
                      ) : (
                        <div className="submission-btns">
                          <button className="btn btn-success" onClick={handleApproveSubmission}>
                            Approve
                          </button>

                          <button className="btn btn-danger" onClick={handleRejectSubmission}>
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p>No submissions yet!!</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* CHAT */}

          <div className="project-chat-container">
            <h4>Chat with the Freelancer</h4>
            <hr />

            {project.freelancerId ? (
              <div className="chat-body">
                <div className="chat-messages">
                  {chats?.messages?.map((msg, index) => (
                    <div
                      key={index}
                      className={
                        msg.senderId === localStorage.getItem("userId")
                          ? "my-message"
                          : "received-message"
                      }
                    >
                      <div>
                        <p>{msg.text}</p>
                        <h6>
                          {msg.time?.slice(5, 10)} - {msg.time?.slice(11, 19)}
                        </h6>
                      </div>
                    </div>
                  ))}
                </div>

                <hr />

                <div className="chat-input">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter something..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />

                  <button onClick={handleMessageSend}>Send</button>
                </div>
              </div>
            ) : (
              <i style={{ color: "#938f8f" }}>
                Chat will be enabled if the project is assigned to you!!
              </i>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectWorking;